export function createStandardPartition<T>(
  users: T[],
  groupCount: number,
): T[][] {
  if (groupCount <= 0) return [];
  // create array of array with length groupCount
  const result: T[][] = Array.from({ length: groupCount }, () => []);
  for (let i = 0; i < users.length; i++) {
    result[i % groupCount].push(users[i]);
  }
  return result.filter((group) => group.length > 0);
}
