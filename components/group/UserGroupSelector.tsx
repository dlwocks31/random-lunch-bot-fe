import { Chip } from "@mui/material";
import { SlackUser } from "../../utils/slack/slack-user";
import Select from "react-select";

export function UserGroupSelector({
  allUsers,
  groupUsers,
  groupLabel,
  addGroupUser,
}: {
  allUsers: SlackUser[];
  groupUsers: SlackUser[];
  groupLabel: string;
  addGroupUser: (userId: string) => void;
}) {
  const unselectedUsers = allUsers.filter(
    (u) => !groupUsers.some((su) => su.id === u.id),
  );
  return (
    <div className="root">
      <div className="top-root">
        <div>{groupLabel}</div>
        <Select
          placeholder={`${groupLabel} 그룹에 추가할 유저 이름을 검색하세요`}
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
      <div>
        {groupUsers.map((u) => (
          <Chip label={u.displayName} key={u.id} />
        ))}
      </div>
      <style jsx>{`
        .top-root {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .root {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border: 1px solid #1976d2;
          padding: 10px;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
}
