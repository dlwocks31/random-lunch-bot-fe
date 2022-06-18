import { Button } from "@mui/material";
import { concat, groupBy } from "lodash";
import { useEffect, useState } from "react";
import { createStandardPartition } from "../utils/group/CreateStandardPartition";
import { optimizePartition } from "../utils/group/OptimizePartition";
import { SlackUser } from "../utils/slack/slack-user";
import { FlexUserFetcher } from "./fetch/FlexUserFetcher";
import { EachGroupSizeEditor } from "./group/EachGroupSizeEditor";
import { GroupCountEditor } from "./group/GroupCountEditor";
import { UserGroupTypeSelector } from "./group/UserGroupSelector";
import { TagEditor } from "./tag/TagEditor";
import { GroupType } from "../utils/domain/GroupType";
import { Partition } from "../utils/domain/Partition";
import { Group } from "../utils/domain/Group";
import { HelpIconWithTooltip } from "./util/HelpIconWithTooltip";
import { PartitionConfig } from "../utils/domain/PartitionConfig";
import { getGroupTypeHeuristics } from "../utils/slack/GetGroupTypeHeuristics";

export function PartitionBuilder({
  initialUsers,
  setPartition,
}: {
  initialUsers: SlackUser[];
  setPartition: (partition: Partition) => void;
}) {
  const [eachGroupSize, setEachGroupSize] = useState(4);
  const [partitionConfig, setPartitionConfig] = useState<PartitionConfig>({
    officeUsers: [],
    remoteUsers: [],
    excludedUsers: [],
    officeGroupCount: 0,
    remoteGroupCount: 0,
    tagToUserIdsMap: new Map(),
  });
  useEffect(() => {
    const groupedUser = groupBy(initialUsers, (user) =>
      getGroupTypeHeuristics(user),
    );
    const newPartitionConfig: PartitionConfig = {
      officeUsers: groupedUser[GroupType.OFFICE] || [],
      remoteUsers: groupedUser[GroupType.REMOTE] || [],
      excludedUsers: groupedUser[GroupType.EXCLUDED] || [],
      officeGroupCount: 0,
      remoteGroupCount: 0,
      tagToUserIdsMap: new Map(),
    };
    setPartitionConfig(newPartitionConfig);
  }, [initialUsers]);
  console.log(`initialUsers: ${initialUsers.length}`);

  function addExcludedUser(userId: string) {
    setExcludedUserIf((u) => u.id === userId);
  }

  function addRemoteUser(userId: string) {
    setRemoteUserIf((u) => u.id === userId);
  }

  function addOfficeUser(userId: string) {
    setOfficeUserIf((u) => u.id === userId);
  }
  function addRemoteUsersByEmail(emails: string[]) {
    setRemoteUserIf((u) => emails.includes(u.email));
  }

  function addExcludedUsersByEmail(emails: string[]) {
    setExcludedUserIf((u) => emails.includes(u.email));
  }

  function setOfficeUserIf(predicate: (u: SlackUser) => boolean) {
    const remoteUsers = partitionConfig.remoteUsers.filter(
      (u) => !predicate(u),
    );
    const excludedUsers = partitionConfig.excludedUsers.filter(
      (u) => !predicate(u),
    );
    const officeUsers = concat(
      partitionConfig.officeUsers,
      partitionConfig.remoteUsers.filter(predicate),
      partitionConfig.excludedUsers.filter(predicate),
    );
    setPartitionConfig((config) => ({
      ...config,
      officeUsers,
      remoteUsers,
      excludedUsers,
    }));
  }

  function setRemoteUserIf(predicate: (u: SlackUser) => boolean) {
    const officeUsers = partitionConfig.officeUsers.filter(
      (u) => !predicate(u),
    );
    const excludedUsers = partitionConfig.excludedUsers.filter(
      (u) => !predicate(u),
    );
    const remoteUsers = concat(
      partitionConfig.remoteUsers,
      partitionConfig.officeUsers.filter(predicate),
      partitionConfig.excludedUsers.filter(predicate),
    );
    setPartitionConfig((config) => ({
      ...config,
      officeUsers,
      remoteUsers,
      excludedUsers,
    }));
  }

  function setExcludedUserIf(predicate: (u: SlackUser) => boolean) {
    const officeUsers = partitionConfig.officeUsers.filter(
      (u) => !predicate(u),
    );
    const remoteUsers = partitionConfig.remoteUsers.filter(
      (u) => !predicate(u),
    );
    const excludedUsers = concat(
      partitionConfig.excludedUsers,
      partitionConfig.officeUsers.filter(predicate),
      partitionConfig.remoteUsers.filter(predicate),
    );
    setPartitionConfig((config) => ({
      ...config,
      officeUsers,
      remoteUsers,
      excludedUsers,
    }));
  }
  // start grouping

  const tagMapReversed: Map<string, string[]> = new Map();
  for (const [tag, userIds] of partitionConfig.tagToUserIdsMap.entries() ||
    []) {
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
      createStandardPartition(
        partitionConfig.officeUsers,
        partitionConfig.officeGroupCount,
      ),
      1000,
      groupPenaltyFn,
    );
    const remotePartition = optimizePartition(
      createStandardPartition(
        partitionConfig.remoteUsers,
        partitionConfig.remoteGroupCount,
      ),
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

  useEffect(generateOptimizedPartition, [partitionConfig]);
  // end grouping
  return (
    <div className="config-root">
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
          users={partitionConfig.officeUsers}
          groupCount={partitionConfig.officeGroupCount}
          groupTypeLabel="사무실"
          setGroupCount={(officeGroupCount: number) =>
            setPartitionConfig((config) => ({ ...config, officeGroupCount }))
          }
        />
        <GroupCountEditor
          eachGroupSize={eachGroupSize}
          users={partitionConfig.remoteUsers}
          groupCount={partitionConfig.remoteGroupCount}
          groupTypeLabel="재택"
          setGroupCount={(remoteGroupCount: number) =>
            setPartitionConfig((config) => ({ ...config, remoteGroupCount }))
          }
        />
      </div>
      <div>
        <h3 className="title">조원 설정</h3>
        <UserGroupTypeSelector
          allUsers={initialUsers}
          includedUsers={partitionConfig.officeUsers}
          groupTypeLabel="사무실"
          addGroupUser={addOfficeUser}
        />
        <UserGroupTypeSelector
          allUsers={initialUsers}
          includedUsers={partitionConfig.remoteUsers}
          groupTypeLabel="재택"
          addGroupUser={addRemoteUser}
        />
        <UserGroupTypeSelector
          allUsers={initialUsers}
          includedUsers={partitionConfig.excludedUsers}
          groupTypeLabel="불참"
          addGroupUser={addExcludedUser}
        />
      </div>
      <div>
        <div className="iconed-header">
          <h3 className="title">태그 설정</h3>
          <HelpIconWithTooltip title="같은 태그에 속해있는 유저들은 가능한 한 같은 조에 속하지 않게 됩니다." />
        </div>
        <TagEditor
          users={initialUsers}
          tagMap={partitionConfig.tagToUserIdsMap}
          onTagMapChange={(tagMap) =>
            setPartitionConfig((config) => ({
              ...config,
              tagToUserIdsMap: tagMap,
            }))
          }
        />
      </div>
      <div>
        <div className="iconed-header">
          <h3 className="title">플렉스 연동</h3>
          <HelpIconWithTooltip title="플렉스에서 휴가자, 재택자 정보를 가져올 수 있습니다." />
        </div>
        <FlexUserFetcher
          hasUser={initialUsers.length > 0}
          addRemoteUsersByEmail={addRemoteUsersByEmail}
          addUnselectedUsersByEmail={addExcludedUsersByEmail}
        />
      </div>
      <Button onClick={regenerateOptimizedPartition} variant="outlined">
        재추첨
      </Button>
      <style jsx>{`
        .config-root {
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
