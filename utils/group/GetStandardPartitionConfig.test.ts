import { getStandardPartitionConfig } from "./GetStandardPartitionConfig";

describe("GetStandardPartitionConfig", () => {
  it("9명을 4개의 그룹으로 나누면, 3명 1 그룹, 2명 3 그룹으로 나뉜다", () => {
    const group = getStandardPartitionConfig(9, 4);
    expect(group).toEqual([
      {
        groupSize: 3,
        groupCount: 1,
      },
      {
        groupSize: 2,
        groupCount: 3,
      },
    ]);
  });
});
