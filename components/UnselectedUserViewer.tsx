import Select from "react-select";
import { SlackUser } from "../utils/slack/slack-user";

export function UnselectedUserViewer({
  allUsers,
  unselectedUsers,
  onChange,
}: {
  allUsers: SlackUser[];
  unselectedUsers: SlackUser[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div>
      <div> Unselected User: </div>
      <Select
        placeholder="유저 이름을 검색하세요"
        hideSelectedOptions
        options={allUsers.map(({ id, displayName }) => ({
          value: id,
          label: displayName,
        }))}
        value={unselectedUsers.map(({ id, displayName }) => ({
          value: id,
          label: displayName,
        }))}
        isMulti
        onChange={(e) => onChange(e.map((e) => e.value))}
      />
    </div>
  );
}
