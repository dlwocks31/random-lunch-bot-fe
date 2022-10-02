import { NormalUser } from "../slack/NormalUser";
import { createTagsFromSlackName } from "./CreateTagsFromSlackName";
import { groupUsersFromRawTags } from "./GroupUsersFromRawTag";

export function generateTags(
  users: NormalUser[],
): { userId: string; tag: string }[] {
  const idsWithRawTags: { userId: string; rawTags: string[] }[] = users.map(
    (user) => ({
      userId: user.id,
      rawTags: createTagsFromSlackName(user.name),
    }),
  );
  const groupedUsers = groupUsersFromRawTags(idsWithRawTags);
  const result: { userId: string; tag: string }[] = [];
  for (const group of groupedUsers) {
    for (const userId of group.userIds) {
      result.push({
        userId,
        tag: group.tag,
      });
    }
  }
  return result;
}
