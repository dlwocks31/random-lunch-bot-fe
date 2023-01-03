import { MemberConfig } from "../domain/MemberConfig";
import { NormalUser } from "../slack/NormalUser";

export function mergeMemberConfigGroups(
  members: MemberConfig,
): { groupLabel: string; users: NormalUser[] }[] {
  const groups: { groupLabel: string; users: NormalUser[] }[] = [];
  let groupNum = 1;
  for (const users of members.office.groups) {
    groups.push({
      groupLabel: `${groupNum}조`,
      users,
    });
    groupNum++;
  }
  for (const users of members.remote.groups) {
    groups.push({
      groupLabel: `${groupNum}조`,
      users,
    });
    groupNum++;
  }
  return groups;
}
