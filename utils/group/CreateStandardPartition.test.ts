import { createStandardPartition } from "./CreateStandardPartition";

describe("CreateStandardPartition", () => {
  it("일반적인 파티션을 만든다", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const groupCount = 3;
    const result = createStandardPartition(items, groupCount);
    expect(result).toEqual([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6],
    ]);
  });

  it("아이템이 없을 때에도 정상 작동한다", () => {
    const items: unknown[] = [];
    const groupCount = 3;
    const result = createStandardPartition(items, groupCount);
    expect(result).toEqual([]);
  });
});
