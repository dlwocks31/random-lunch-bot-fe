import { Button, Chip, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { createStandardPartition } from "../utils/group/CreateStandardPartition";
import { optimizePartition } from "../utils/group/OptimizePartition";
import { SlackUser } from "../utils/slack/slack-user";

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

  useEffect(() => {
    setGroupCount(Math.floor(users.length / eachGroupSize));
  }, [users, eachGroupSize]);

  useEffect(() => {
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
    console.log(tagMap);

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
  }, [users, groupCount, tagMap]);

  return (
    <div className="root">
      <div>
        <TextField
          label="원하는 조별 인원 수"
          type="number"
          value={eachGroupSize}
          onChange={(e) => {
            if (e.target.value) setEachGroupSize(Number(e.target.value));
          }}
        />
      </div>
      <div className="group-count-container">
        <div>
          총 {users.length}명의 유저가 {groupCount}개의 조로 추첨됩니다!{" "}
        </div>
        <Button
          variant="contained"
          onClick={() => setGroupCount((gc) => gc + 1)}
        >
          조 개수 +1
        </Button>
        <Button
          variant="contained"
          onClick={() => setGroupCount((gc) => (gc > 1 ? gc - 1 : gc))}
        >
          조 개수 -1
        </Button>
      </div>
      {partition.map((users, i) => (
        <div className="group-container">
          <div>
            <div>
              Group {i + 1} ({users.length}명)
            </div>
          </div>
          {users.map((u) => (
            <div>
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
        .group-count-container {
          display: flex;
        }
      `}</style>
    </div>
  );
}
