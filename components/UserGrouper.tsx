import { Button, Chip } from "@mui/material";
import { shuffle } from "lodash";
import { useEffect, useState } from "react";
import { createStandardPartition } from "../utils/group/CreateStandardPartition";
import { optimizePartition } from "../utils/group/OptimizePartition";
import { SlackUser } from "../utils/slack/slack-user";
import { UserGroupConfigEditor } from "./UserGroupConfigEditor";

export function UserGrouper({
  users,
  tagMap,
  unselectUserFn,
}: {
  users: SlackUser[];
  tagMap: Map<string, string[]>;
  unselectUserFn: (id: string) => void;
}) {
  const [eachGroupSize, setEachGroupSize] = useState(4);
  const [groupCount, setGroupCount] = useState(0);
  const [partition, setPartition] = useState<SlackUser[][]>([]);

  function generateOptimizedPartition() {
    const randomPartition = createStandardPartition(users, groupCount);
    const tagMapReversed: Map<string, string[]> = new Map();
    if (tagMap) {
      for (const [tag, userIds] of tagMap.entries()) {
        for (const userId of userIds) {
          const tagsOfUserId = tagMapReversed.get(userId) || [];
          tagsOfUserId.push(tag);
          tagMapReversed.set(userId, tagsOfUserId);
        }
      }
    }

    const groupPenaltyFn = (team: SlackUser[]): number => {
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
    };
    setPartition(optimizePartition(randomPartition, 1000, groupPenaltyFn));
  }
  function regenerateOptimizedPartition() {
    shuffle(users);
    generateOptimizedPartition();
  }
  useEffect(generateOptimizedPartition, [users, groupCount, tagMap]);

  return (
    <div className="root">
      <UserGroupConfigEditor
        eachGroupSize={eachGroupSize}
        groupCount={groupCount}
        users={users}
        setEachGroupSize={setEachGroupSize}
        setGroupCount={setGroupCount}
      />
      <Button onClick={regenerateOptimizedPartition}>재추첨</Button>
      {partition.map((users, i) => (
        <div className="group-container" key={users.map((u) => u.id).join("-")}>
          <div>
            <div>
              Group {i + 1} ({users.length}명)
            </div>
          </div>
          {users.map((u) => (
            <div key={u.id}>
              <Chip
                label={u.displayName}
                onDelete={() => unselectUserFn(u.id)}
              />
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
