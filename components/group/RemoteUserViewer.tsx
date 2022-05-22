import Select from "react-select";
import { SlackUser } from "../../utils/slack/slack-user";

export function RemoteUserViewer({
  allUsers,
  remoteUsers,
  onChange,
}: {
  allUsers: SlackUser[];
  remoteUsers: SlackUser[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div>
      <div>재택 중인 유저:</div>
      <Select
        placeholder="유저 이름을 검색하세요"
        hideSelectedOptions
        options={allUsers.map(({ id, displayName }) => ({
          value: id,
          label: displayName,
        }))}
        value={remoteUsers.map(({ id, displayName }) => ({
          value: id,
          label: displayName,
        }))}
        isMulti
        onChange={(e) => onChange(e.map((e) => e.value))}
      />
    </div>
  );
}
