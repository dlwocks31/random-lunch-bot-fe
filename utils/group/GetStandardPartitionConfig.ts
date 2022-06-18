import { groupBy, sortBy } from "lodash";
import { createStandardPartition } from "./CreateStandardPartition";

export function getStandardPartitionConfig(
  usersCount: number,
  groupCount: number,
): { groupSize: number; groupCount: number }[] {
  if (groupCount <= 0 || !usersCount || !groupCount) return [];
  const fakeUsers = Array.from({ length: usersCount }, () => 0);
  const result = createStandardPartition(fakeUsers, groupCount);
  const grouped = groupBy(result, (group) => group.length);
  const groupSizes = sortBy(
    Object.keys(grouped).map((key) => parseInt(key, 10)),
    (key) => -key,
  );
  return groupSizes.map((size) => ({
    groupSize: size,
    groupCount: grouped[size].length,
  }));
}
