import { Button } from "@mui/material";
import { concat, shuffle } from "lodash";
import { useEffect, useState } from "react";
import { LunchUser } from "../utils/domain/LunchUser";
import { createStandardPartition } from "../utils/group/CreateStandardPartition";
import { optimizePartition } from "../utils/group/OptimizePartition";
import { SlackUser } from "../utils/slack/slack-user";
import { FlexUserFetcher } from "./fetch/FlexUserFetcher";
import { EachGroupSizeEditor } from "./group/EachGroupSizeEditor";
import { GroupCountEditor } from "./group/GroupCountEditor";
import { RemoteUserViewer } from "./group/RemoteUserViewer";
import { UnselectedUserViewer } from "./group/UnselectedUserViewer";
import { UserGroupSelector } from "./group/UserGroupSelector";
import { TagEditor } from "./tag/TagEditor";

export function PartitionBuilder({
  initialUsers,
  setPartition,
}: {
  initialUsers: SlackUser[];
  setPartition: (partition: SlackUser[][]) => void;
}) {
  const [eachGroupSize, setEachGroupSize] = useState(4);
  const [officeGroupCount, setOfficeGroupCount] = useState(0);
  const [remoteGroupCount, setRemoteGroupCount] = useState(0);
  const [tagMap, setTagMap] = useState<Map<string, string[]>>(new Map());
  const [users, setUsers] = useState<LunchUser[]>([]);
  useEffect(() => {
    setUsers(
      initialUsers.map((u) => ({
        user: u,
        selected: !(
          u.statusEmoji === ":palm_tree:" || u.statusMessage.includes("휴직")
        ),
        isRemote: u.statusEmoji === ":house_with_garden:",
      })),
    );
  }, [initialUsers]);
  console.log(`users: ${users.length}, initialUsers: ${initialUsers.length}`);
  function officeUsers() {
    return users.filter((u) => u.selected && !u.isRemote).map((u) => u.user);
  }
  function remoteUsers() {
    return users.filter((u) => u.selected && u.isRemote).map((u) => u.user);
  }

  function unselectedUsers() {
    return users.filter((u) => !u.selected).map((u) => u.user);
  }

  function allSlackUsers() {
    return users.map((u) => u.user);
  }

  function addUnselectUser(userId: string) {
    setUsers((users) =>
      users.map((u) => {
        const unselected = u.user.id === userId;
        if (unselected) {
          return {
            ...u,
            isRemote: false,
            selected: false,
          };
        }
        return u;
      }),
    );
  }

  function addRemoteUser(userId: string) {
    setUsers((users) =>
      users.map((u) => {
        const remote = u.user.id === userId;
        if (remote) {
          return {
            ...u,
            isRemote: true,
            selected: true,
          };
        }
        return u;
      }),
    );
  }

  function addOfficeUser(userId: string) {
    setUsers((users) =>
      users.map((u) => {
        const office = u.user.id === userId;
        if (office) {
          return {
            ...u,
            isRemote: false,
            selected: true,
          };
        }
        return u;
      }),
    );
  }
  function addRemoteUsersByEmail(emails: string[]) {
    setUsers((users) =>
      users.map((u) => {
        const isRemote =
          (u.isRemote || emails.includes(u.user.email)) && u.selected;
        return {
          ...u,
          isRemote,
        };
      }),
    );
  }

  function addUnselectedUsersByEmail(emails: string[]) {
    setUsers((users) =>
      users.map((u) => {
        const selected = emails.includes(u.user.email) ? false : u.selected;
        return {
          ...u,
          selected,
          isRemote: selected ? u.isRemote : false,
        };
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
    setPartition(concat(officePartition, remotePartition));
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
        <EachGroupSizeEditor setEachGroupSize={setEachGroupSize} />
        <div>
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
        <UserGroupSelector
          allUsers={allSlackUsers()}
          groupUsers={unselectedUsers()}
          groupLabel="불참"
          addGroupUser={addUnselectUser}
        />
        <UserGroupSelector
          allUsers={allSlackUsers()}
          groupUsers={remoteUsers()}
          groupLabel="재택"
          addGroupUser={addRemoteUser}
        />
        <UserGroupSelector
          allUsers={allSlackUsers()}
          groupUsers={officeUsers()}
          groupLabel="사무실"
          addGroupUser={addOfficeUser}
        />
        <FlexUserFetcher
          users={users}
          addRemoteUsersByEmail={addRemoteUsersByEmail}
          addUnselectedUsersByEmail={addUnselectedUsersByEmail}
        />
        <TagEditor
          users={initialUsers}
          tagMap={tagMap}
          onTagMapChange={setTagMap}
        />
        <Button onClick={regenerateOptimizedPartition}>재추첨</Button>
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
      `}</style>
    </div>
  );
}
