import { generateRandomPartition } from "./GenerateRandomPartition";

describe("#generateRandomPartition", () => {
  describe("maxParitionSize가 4일때", () => {
    it("8명은 4명, 4명의 그룹으로 나뉘어진다", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8];
      const partition = generateRandomPartition(arr, 4, 4);
      expect(partition.length).toEqual(2);
      expect(partition[0].length).toEqual(4);
      expect(partition[0].length).toEqual(4);
    });
    it("10명은 4명, 3명, 3명의 그룹으로 나뉘어진다", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const partition = generateRandomPartition(arr, 4, 4);
      expect(partition.length).toEqual(3);
      expect(partition[0].length).toEqual(4);
      expect(partition[1].length).toEqual(3);
      expect(partition[2].length).toEqual(3);
    });
    it("13명은 4명, 3명, 3명, 3명의 그룹으로 나뉘어진다", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      const partition = generateRandomPartition(arr, 4, 4);
      expect(partition.length).toEqual(4);
      expect(partition[0].length).toEqual(4);
      expect(partition[1].length).toEqual(3);
      expect(partition[2].length).toEqual(3);
      expect(partition[3].length).toEqual(3);
    });
  });
  describe("maxPartitionSize가 6일때", () => {
    it("5명은 5명의 그룹으로 나뉘어진다", () => {
      const arr = [1, 2, 3, 4, 5];
      const partition = generateRandomPartition(arr, 6, 6);
      expect(partition.length).toEqual(1);
      expect(partition[0].length).toEqual(5);
    });
    it("9명은 5명, 4명의 그룹으로 나뉘어진다", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const partition = generateRandomPartition(arr, 6, 6);
      expect(partition.length).toEqual(2);
      expect(partition[0].length).toEqual(5);
      expect(partition[1].length).toEqual(4);
    });
  });

  describe("maxPartitionSize가 5고, preferredPartitionSize가 4일때", () => {
    it("13명은 5명, 4명, 4명의 그룹으로 나뉘어진다", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      const partition = generateRandomPartition(arr, 5, 4);
      expect(partition.length).toEqual(3);
      expect(partition[0].length).toEqual(5);
      expect(partition[1].length).toEqual(4);
      expect(partition[2].length).toEqual(4);
    });

    it("50명은 5명 2그룹, 4명 10그룹으로 나뉘어진다", () => {
      const arr = Array(50)
        .fill(0)
        .map((_, i) => i + 1);
      const partition = generateRandomPartition(arr, 5, 4);
      expect(partition.length).toEqual(12);
      expect(partition[0].length).toEqual(5);
      expect(partition[1].length).toEqual(5);
      for (let i = 2; i < 12; i++) {
        expect(partition[i].length).toEqual(4);
      }
    });
  });
});
