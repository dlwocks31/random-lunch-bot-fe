export function createRandomGroup<T>(users: T[], groupCount: number) {
  if (groupCount <= 0) return [];
  const result: T[][] = Array(groupCount);
  for (let i = 0; i < groupCount; i++) {
    result[i] = [];
  }
  for (let i = 0; i < users.length; i++) {
    result[i % groupCount].push(users[i]);
  }
  return result;
}
