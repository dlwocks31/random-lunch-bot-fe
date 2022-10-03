import { FlexApiService } from "./FlexApiService";

const flexUid = "6c4b88a2-314f-4957-8fa1-3d584264ff4f";
describe.skip("FlexApiService", () => {
  it("모든 부서 id를 가져올 수 있다", async () => {
    const sut = new FlexApiService(flexUid);
    const ids = await sut.getDepartmentIds();
    console.log(ids);
    expect(ids).not.toHaveLength(0);
  });

  it("부서 id를 통해 유저를 가져올 수 있다", async () => {
    const sut = new FlexApiService(flexUid);
    const users = await sut.searchSimpleUsers(["WkzWrOp50y"]); // 제품 그룹
    console.log(users);
    expect(users).not.toHaveLength(0);
  });

  it("유저의 id를 통해 특정 날짜의 근무시간을 가져올 수 있다", async () => {
    const sut = new FlexApiService(flexUid);
    const result = await sut.getWorkSchedules(
      ["jkEgKaeEpw"], // 이재찬
      "2022-10-04",
    );
    console.log(JSON.stringify(result, null, 2));
    expect(result).not.toHaveLength(0);
  });
});
