/**
 * 유저 이름에서 추출한 태그를 한번 정제해서, 비슷한 태그를 가진 유저들끼리 같은 그룹에 묶일 수 있게 하는 역할을 한다.
 */
export function groupUsersFromRawTags(
  users: { userId: string; rawTags: string[] }[],
): {
  tag: string;
  userIds: string[];
}[] {
  const allTags = users.flatMap((user) => user.rawTags);
  const uniqueTags = [...new Set(allTags)];
  const result: {
    tag: string;
    userIds: string[];
  }[] = [];
  const findUserIdsByPrefix = (prefix: string) => {
    return users
      .filter((user) => user.rawTags.some((tag) => tag.startsWith(prefix)))
      .map((user) => user.userId);
  };
  for (const tag of uniqueTags) {
    let maxPrefix = tag.slice(0, 2);
    let maxPrefixUserIds = findUserIdsByPrefix(maxPrefix);
    if (maxPrefixUserIds.length <= 1) continue;
    if (result.some((group) => group.tag.startsWith(maxPrefix))) continue;
    for (let i = 3; i <= tag.length; i++) {
      const prefix = tag.slice(0, i);
      const userIds = findUserIdsByPrefix(prefix);
      if (userIds.length < maxPrefixUserIds.length) break;
      maxPrefix = prefix;
    }
    if (maxPrefixUserIds.length > 1) {
      result.push({
        tag: maxPrefix,
        userIds: maxPrefixUserIds,
      });
    }
  }
  return result;
}
