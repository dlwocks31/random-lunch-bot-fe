import { Button, Chip } from "@mui/material";
import { concat, shuffle } from "lodash";
import { useEffect, useState } from "react";
import { createStandardPartition } from "../../utils/group/CreateStandardPartition";
import { optimizePartition } from "../../utils/group/OptimizePartition";
import { SlackUser } from "../../utils/slack/slack-user";
import { EachGroupSizeEditor } from "./EachGroupSizeEditor";
import { GroupCountEditor } from "./GroupCountEditor";

export function UserGrouper({
  officeUsers,
  remoteUsers,
  tagMap,
}: {
  officeUsers: SlackUser[];
  remoteUsers: SlackUser[];
  tagMap: Map<string, string[]>;
}) {
  const [eachGroupSize, setEachGroupSize] = useState(4);
  const [officeGroupCount, setOfficeGroupCount] = useState(0);
  const [remoteGroupCount, setRemoteGroupCount] = useState(0);
  const [partition, setPartition] = useState<SlackUser[][]>([]);

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
    shuffle(officeUsers);
    shuffle(remoteUsers);
    const officePartition = optimizePartition(
      createStandardPartition(officeUsers, officeGroupCount),
      1000,
      groupPenaltyFn,
    );
    const remotePartition = optimizePartition(
      createStandardPartition(remoteUsers, remoteGroupCount),
      1000,
      groupPenaltyFn,
    );
    setPartition(concat(officePartition, remotePartition));
  }
  function regenerateOptimizedPartition() {
    shuffle(remoteUsers);
    shuffle(officeUsers);
    generateOptimizedPartition();
  }
  useEffect(generateOptimizedPartition, [
    officeUsers,
    remoteUsers,
    officeGroupCount,
    remoteGroupCount,
    tagMap,
  ]);

  return (
    <div className="root">
      <EachGroupSizeEditor
        eachGroupSize={eachGroupSize}
        setEachGroupSize={setEachGroupSize}
      />
      <div>
        <div>
          <div>사무실 조 편성</div>
          <GroupCountEditor
            eachGroupSize={eachGroupSize}
            users={officeUsers}
            groupCount={officeGroupCount}
            setGroupCount={setOfficeGroupCount}
          />
        </div>
        <div>
          <div>재택 조 편성</div>
          <GroupCountEditor
            eachGroupSize={eachGroupSize}
            users={remoteUsers}
            groupCount={remoteGroupCount}
            setGroupCount={setRemoteGroupCount}
          />
        </div>
      </div>

      <Button onClick={regenerateOptimizedPartition}>재추첨</Button>
      {partition.map((users, i) => (
        <div className="group-container" key={users.map((u) => u.id).join("-")}>
          <div>
            <div>
              Group {i + 1} ({users.length}명) (
              {i < officeGroupCount ? "사무실" : "재택"})
            </div>
          </div>
          {users.map((u) => (
            <div key={u.id}>
              <Chip label={u.displayName} />
            </div>
          ))}
        </div>
      ))}
      <style jsx>{`
        .group-container {
          display: flex;
          gap: 3px;
          align-items: center;
        }
        .root {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>
    </div>
  );
}
