import { Chip } from "@mui/material";
import { generateRandomPartition } from "../utils/group/GenerateRandomPartition";
import { SlackUser } from "../utils/slack/slack-user";

export function UserGrouper({
  users,
  unselectUserFn,
}: {
  users: SlackUser[];
  unselectUserFn: (id: string) => void;
}) {
  const grouped = generateRandomPartition(users, 4, 4);
  return (
    <div className="root">
      <div>총 {users.length}명의 유저가 아래와 같이 추첨될 수 있습니다!</div>
      {grouped.map((users, i) => (
        <div className="group-container">
          <div>
            <div>Group {i + 1}</div>
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
      `}</style>
    </div>
  );
}
