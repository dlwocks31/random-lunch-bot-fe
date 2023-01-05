import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { NormalUser } from "../../utils/slack/NormalUser";
type PartitionType = "office" | "remote" | "excluded";
export const UserSelector = ({
  members,
  setMembers,
  currentPartitionLabel,
  creatable,
}: {
  members: MemberConfig;
  setMembers: (members: MemberConfig) => void;
  currentPartitionLabel: PartitionType;
  creatable: boolean;
}) => {
  const allUsers = members.allUsers();
  const onSelectFn = (
    selectedOption: { value: string; label: string } | null,
  ) => {
    const selectedUser = allUsers.find((u) => u.id === selectedOption?.value);
    if (selectedUser === undefined) return;
    if (currentPartitionLabel === "office") {
      setMembers(members.moveMemberToOffice(selectedUser));
    } else if (currentPartitionLabel === "remote") {
      setMembers(members.moveMemberToRemote(selectedUser));
    } else {
      setMembers(members.moveMemberToExcluded(selectedUser));
    }
  };
  const currentVisibleUsers =
    currentPartitionLabel === "office"
      ? members.office.users()
      : currentPartitionLabel === "remote"
      ? members.remote.users()
      : members.excluded;
  return creatable ? (
    <CreatableSelect
      placeholder="조원을 검색하거나 추가하세요"
      options={allUsers
        .filter((u) => !currentVisibleUsers.includes(u))
        .map(({ id, name }) => ({
          value: id,
          label: name,
        }))}
      value={null}
      onChange={onSelectFn}
      onCreateOption={(name: string) => {
        const newUser = new NormalUser(name);
        if (currentPartitionLabel === "office") {
          setMembers(members.addOfficeUser(newUser));
        } else if (currentPartitionLabel === "remote") {
          setMembers(members.addRemoteUser(newUser));
        } else {
          setMembers(members.addExcludedUser(newUser));
        }
      }}
    />
  ) : (
    <Select
      placeholder="조원을 검색하세요"
      options={allUsers
        .filter((u) => !currentVisibleUsers.includes(u))
        .map(({ id, name }) => ({
          value: id,
          label: name,
        }))}
      value={null}
      onChange={onSelectFn}
    />
  );
};
