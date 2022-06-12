import { Button, IconButton, Tooltip } from "@mui/material";
import { concat } from "lodash";
import { useEffect, useState } from "react";
import { LunchUser } from "../utils/domain/LunchUser";
import { createStandardPartition } from "../utils/group/CreateStandardPartition";
import { optimizePartition } from "../utils/group/OptimizePartition";
import { SlackUser } from "../utils/slack/slack-user";
import { FlexUserFetcher } from "./fetch/FlexUserFetcher";
import { EachGroupSizeEditor } from "./group/EachGroupSizeEditor";
import { GroupCountEditor } from "./group/GroupCountEditor";
import { UserGroupTypeSelector } from "./group/UserGroupSelector";
import { TagEditor } from "./tag/TagEditor";
import HelpIcon from "@mui/icons-material/Help";
import { GroupType } from "../utils/domain/GroupType";
import { Partition } from "../utils/domain/Partition";
import { Group } from "../utils/domain/Group";

export function PartitionBuilder({
  initialUsers,
  setPartition,
}: {
  initialUsers: SlackUser[];
  setPartition: (partition: Partition) => void;
}) {
  const [eachGroupSize, setEachGroupSize] = useState(4);
  const [officeGroupCount, setOfficeGroupCount] = useState(0);
  const [remoteGroupCount, setRemoteGroupCount] = useState(0);
  const [tagMap, setTagMap] = useState<Map<string, string[]>>(new Map());
  const [users, setUsers] = useState<LunchUser[]>([]);
  useEffect(() => {
    setUsers(
      initialUsers.map((user) => {
        const groupType: GroupType =
          user.statusEmoji === ":palm_tree:" ||
          user.statusMessage.includes("휴직")
            ? GroupType.EXCLUDED
            : user.statusEmoji === ":house_with_garden:"
            ? GroupType.REMOTE
            : GroupType.OFFICE;
        return new LunchUser(user, groupType);
      }),
    );
  }, [initialUsers]);
  console.log(`users: ${users.length}, initialUsers: ${initialUsers.length}`);
  function officeUsers() {
    return users.filter((u) => u.isOffice()).map((u) => u.user);
  }
  function remoteUsers() {
    return users.filter((u) => u.isRemote()).map((u) => u.user);
  }

  function excludedUsers() {
    return users.filter((u) => u.isExcluded()).map((u) => u.user);
  }

  function allSlackUsers() {
    return users.map((u) => u.user);
  }

  function addExcludedUser(userId: string) {
    setUserGroupTypeIf(GroupType.EXCLUDED, (u) => u.id === userId);
  }

  function addRemoteUser(userId: string) {
    setUserGroupTypeIf(GroupType.REMOTE, (u) => u.id === userId);
  }

  function addOfficeUser(userId: string) {
    setUserGroupTypeIf(GroupType.OFFICE, (u) => u.id === userId);
  }
  function addRemoteUsersByEmail(emails: string[]) {
    setUserGroupTypeIf(GroupType.REMOTE, (u) => emails.includes(u.email));
  }

  function addExcludedUsersByEmail(emails: string[]) {
    setUserGroupTypeIf(GroupType.EXCLUDED, (u) => emails.includes(u.email));
  }

  function setUserGroupTypeIf(
    groupType: GroupType,
    predicate: (u: SlackUser) => boolean,
  ) {
    setUsers((users) =>
      users.map((u) => {
        if (predicate(u.user)) {
          return new LunchUser(u.user, groupType);
        } else {
          return u;
        }
      }),
    );
  }

  // start grouping

  const tagMapReversed: Map<string, string[]> = new Map();
  for (const [tag, userIds] of tagMap.entries() || []) {
    for (const userId of userIds) {
      const tagsOfUserId = tagMapReversed.get(userId) || [];
      tagsOfUserId.push(tag);
      tagMapReversed.set(userId, tagsOfUserId);
    }
  }

  function groupPenaltyFn(team: SlackUser[]): number {
    let sumScore = 0;

    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        const u1 = team[i];
        const u2 = team[j];
        const tagsOfU1 = tagMapReversed.get(u1.id) || [];
        const tagsOfU2 = tagMapReversed.get(u2.id) || [];
        for (const t1 of tagsOfU1) {
          for (const t2 of tagsOfU2) {
            if (t1 === t2) {
              // todo: use function call
              sumScore += 1;
            }
          }
        }
      }
    }
    return sumScore;
  }

  function generateOptimizedPartition() {
    console.log("Generate optimized partition");
    const officePartition = optimizePartition(
      createStandardPartition(officeUsers(), officeGroupCount),
      1000,
      groupPenaltyFn,
    );
    const remotePartition = optimizePartition(
      createStandardPartition(remoteUsers(), remoteGroupCount),
      1000,
      groupPenaltyFn,
    );
    console.log(
      `officePartition: ${officePartition}, remotePartition: ${remotePartition}`,
    );
    setPartition({
      groups: concat(
        officePartition.map((users) => new Group(GroupType.OFFICE, users)),
        remotePartition.map((users) => new Group(GroupType.REMOTE, users)),
      ),
    });
  }
  function regenerateOptimizedPartition() {
    generateOptimizedPartition();
  }
  /*
  외부에서 officeUsers, remoteUsers를 `.filter`해서 내려준다. 
  이떄 만약 officeUsers에 대해 useEffect한다면:
  - Home이 rerender될 때 officeUser는 항상 재생성된다
  - 따라서 여기 있는 useEffect가 작동하고 generateOptimizedPartition -> setPartition이 실행되게 됨.
  - setPartition은 Home의 rerender를 유발함으로 무한 루프가 돌게 됨..
  이걸 방지하기 위해 officeUsers대신 .length 에 대해 useEffect를 해준다.
  */
  useEffect(generateOptimizedPartition, [
    officeUsers().length,
    remoteUsers().length,
    officeGroupCount,
    remoteGroupCount,
    tagMap,
  ]);
  // end grouping
  return (
    <div className="config-root">
      <div className="config-container">
        <div>
          <h3 className="title">조별 기본 인원 수</h3>
          <EachGroupSizeEditor
            eachGroupSize={eachGroupSize}
            setEachGroupSize={setEachGroupSize}
          />
        </div>
        <div>
          <h3 className="title">조 개수 설정</h3>
          <GroupCountEditor
            eachGroupSize={eachGroupSize}
            users={officeUsers()}
            groupCount={officeGroupCount}
            groupTypeLabel="사무실"
            setGroupCount={setOfficeGroupCount}
          />
          <GroupCountEditor
            eachGroupSize={eachGroupSize}
            users={remoteUsers()}
            groupCount={remoteGroupCount}
            groupTypeLabel="재택"
            setGroupCount={setRemoteGroupCount}
          />
        </div>
        <div>
          <h3 className="title">조원 설정</h3>
          <UserGroupTypeSelector
            allUsers={allSlackUsers()}
            includedUsers={excludedUsers()}
            groupTypeLabel="불참"
            addGroupUser={addExcludedUser}
          />
          <UserGroupTypeSelector
            allUsers={allSlackUsers()}
            includedUsers={remoteUsers()}
            groupTypeLabel="재택"
            addGroupUser={addRemoteUser}
          />
          <UserGroupTypeSelector
            allUsers={allSlackUsers()}
            includedUsers={officeUsers()}
            groupTypeLabel="사무실"
            addGroupUser={addOfficeUser}
          />
        </div>
        <div>
          <div className="iconed-header">
            <h3 className="title">태그 설정</h3>
            <Tooltip title="같은 태그에 속해있는 유저들은 가능한 한 같은 조에 속하지 않게 됩니다.">
              <IconButton disableRipple>
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </div>
          <TagEditor
            users={initialUsers}
            tagMap={tagMap}
            onTagMapChange={setTagMap}
          />
        </div>
        <div>
          <div className="iconed-header">
            <h3 className="title">플렉스 연동</h3>
            <Tooltip title="플렉스에서 휴가자, 재택자 정보를 가져올 수 있습니다.">
              <IconButton disableRipple>
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </div>
          <FlexUserFetcher
            users={users}
            addRemoteUsersByEmail={addRemoteUsersByEmail}
            addUnselectedUsersByEmail={addExcludedUsersByEmail}
          />
        </div>
        <Button onClick={regenerateOptimizedPartition} variant="outlined">
          재추첨
        </Button>
      </div>
      <style jsx>{`
        .config-root {
          display: flex;
        }
        .config-container {
          border-radius: 20px;
          padding: 20px;
          border: 2px solid #1976d2;
          flex-grow: 1;

          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .iconed-header {
          display: flex;
          align-items: center;
        }
        .title {
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
}
