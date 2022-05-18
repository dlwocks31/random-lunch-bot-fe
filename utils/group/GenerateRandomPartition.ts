import { shuffle } from "lodash";

export function generateRandomPartition<T>(
  users: T[],
  maxPartitionSize: number,
  preferredPartitionSize: number,
) {
  const userList = shuffle(users);
  if (maxPartitionSize === preferredPartitionSize) {
    const groupCount =
      users.length % maxPartitionSize == 0
        ? Math.floor(users.length / maxPartitionSize)
        : Math.floor(users.length / maxPartitionSize) + 1;
    const baseGroupLength = Math.floor(users.length / groupCount);
    const surplusGroupCount = userList.length - groupCount * baseGroupLength;
    const ret: T[][] = [];
    for (let i = 0; i < surplusGroupCount; i++) {
      ret.push(userList.splice(0, baseGroupLength + 1));
    }
    for (let i = 0; i < groupCount - surplusGroupCount; i++) {
      ret.push(userList.splice(0, baseGroupLength));
    }
    return ret;
  } else if (maxPartitionSize === preferredPartitionSize + 1) {
    const remainder = userList.length % preferredPartitionSize;
    const ret = [];
    for (let i = 0; i < remainder; i++) {
      ret.push(userList.splice(0, maxPartitionSize));
    }
    while (userList.length > 0) {
      ret.push(userList.splice(0, preferredPartitionSize));
    }
    return ret;
  } else {
    // 모르겠다..
    return [];
  }
}
