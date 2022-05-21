import { Button, Chip, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { createRandomGroup } from "../utils/group/CreateRandomGroup";
import { SlackUser } from "../utils/slack/slack-user";

export function UserGrouper({
  users,
  unselectUserFn,
}: {
  users: SlackUser[];
  unselectUserFn: (id: string) => void;
}) {
  const [eachGroupSize, setEachGroupSize] = useState(4);
  const [groupCount, setGroupCount] = useState(0);

  useEffect(() => {
    setGroupCount(Math.floor(users.length / eachGroupSize));
  }, [users, eachGroupSize]);

  const partition = createRandomGroup(users, groupCount);
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
