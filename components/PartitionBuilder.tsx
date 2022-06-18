import { Button, Chip } from "@mui/material";
import { concat } from "lodash";
import { useEffect } from "react";
import { Group } from "../utils/domain/Group";
import { GroupType } from "../utils/domain/GroupType";
import { Partition } from "../utils/domain/Partition";
import { PartitionConfig } from "../utils/domain/PartitionConfig";
import { createStandardPartition } from "../utils/group/CreateStandardPartition";
import { optimizePartition } from "../utils/group/OptimizePartition";
import { SlackUser } from "../utils/slack/slack-user";

export function PartitionBuilder({
  partitionConfig,
  partition,
  setPartition,
}: {
  partitionConfig: PartitionConfig;
  partition: Partition;
  setPartition: (partition: Partition) => void;
}) {
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

  useEffect(generateOptimizedPartition, [partitionConfig]);
  return (
    <div>
      {partition.groups.map((group, i) => (
        <div
          className="group-container"
          key={group.users.map((u) => u.id).join("-")}
        >
          <div>
            <div>
              Group {i + 1} ({group.users.length}명) (
              {group.groupType === GroupType.OFFICE ? "사무실" : "재택"})
            </div>
          </div>
          {group.users.map((u) => (
            <div key={u.id}>
              <Chip label={u.displayName} />
            </div>
          ))}
        </div>
      ))}
      <Button onClick={generateOptimizedPartition} variant="outlined">
        재추첨
      </Button>
      <style jsx>{`
        .group-container {
          display: flex;
          gap: 3px;
          align-items: center;
          padding: 2px 0;
        }
      `}</style>
    </div>
  );
}
