import { NormalUser } from "../slack/NormalUser";
import { createCommonTokens } from "./CreateCommonTokens";
import { createTagsFromSlackName } from "./CreateTagsFromSlackName";

export function generateTags(
  users: NormalUser[],
): { userId: string; tag: string }[] {
  const newTagMap: Map<string, string[]> = new Map();
  const allRawTags = [];
  for (const user of users) {
    allRawTags.push(...createTagsFromSlackName(user.name));
  }
  const commonTokens = createCommonTokens(allRawTags);
  const allTags = allRawTags
    .filter((tag) => !commonTokens.some((token) => tag.includes(token)))
    .concat(commonTokens);

  for (const tag of allTags) {
    newTagMap.set(tag, []);
  }

  for (const user of users) {
    const rawTags = createTagsFromSlackName(user.name);
    for (const tag of rawTags) {
      for (const addToTags of allTags) {
        if (tag.includes(addToTags)) {
          const userIds = newTagMap.get(addToTags) || [];
          userIds.push(user.id);
          newTagMap.set(addToTags, userIds);
        }
      }
    }
  }
  // remove tag with only one person
  for (const [tag, userIds] of newTagMap.entries()) {
    if (userIds.length <= 1) {
      newTagMap.delete(tag);
    }
  }
  // uniqueize each userId list
  for (const [tag, userIds] of newTagMap.entries()) {
    newTagMap.set(tag, [...new Set(userIds)]);
  }

  const res: { userId: string; tag: string }[] = [];
  for (const [tag, userIds] of newTagMap.entries()) {
    for (const userId of userIds) {
      res.push({ userId, tag });
    }
  }
  return res;
}
