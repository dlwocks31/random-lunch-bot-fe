import { Chip } from "@mui/material";
import { SlackUser } from "../../utils/slack/slack-user";
import Select from "react-select";
import { GroupCountEditor } from "./GroupCountEditor";

export function UserGroupTypeSelector({
  allUsers,
  includedUsers: includedUsers,
  groupTypeLabel,
  addGroupUser,
}: {
  allUsers: SlackUser[];
  includedUsers: SlackUser[];
  groupTypeLabel: string;
  addGroupUser: (userId: string) => void;
}) {
  const unselectedUsers = allUsers.filter(
    (u) => !includedUsers.some((su) => su.id === u.id),
  );
  return (
    <div className="root">
      <div className="top-root">
        <div>
          {groupTypeLabel} (총 {includedUsers.length}명)
        </div>
        <div>
          <Select
            placeholder={`${groupTypeLabel} 그룹에 추가할 유저 이름을 검색하세요`}
            options={unselectedUsers.map(({ id, displayName }) => ({
              value: id,
              label: displayName,
            }))}
            value={null}
            onChange={(e) => {
              if (e) {
                addGroupUser(e.value);
              }
            }}
          />
        </div>
      </div>
      <div>
        {includedUsers.map((u) => (
          <Chip sx={{ margin: "3px 1px" }} label={u.displayName} key={u.id} />
        ))}
      </div>
      <style jsx>{`
        .top-root {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .root {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border: 1px solid #1976d2;
          padding: 10px;
          border-radius: 5px;
          margin: 3px 0;
        }
      `}</style>
    </div>
  );
}
