import { FlexApiService } from "./FlexApiService";

describe("FlexApiService", () => {
  it("api test", async () => {
    const flexUid = "5ee9ae0e-a8d7-46c8-99e9-3b7e1cd50e0b";
    const sut = new FlexApiService(flexUid);
    const ids = await sut.getDepartmentIds();
    console.log(`ids: ${ids}`);
    const result = await sut.searchSimpleUsers(ids);
    console.log(`result: ${result.map((r) => [r.flexId])}`);

    const users = result.filter((r) =>
      ["이철성", "김채은", "이재찬"].includes(r.name),
    );
    const secondResult = await sut.getWorkSchedules(
      users.map((u) => u.flexId),
      "2022-05-26",
    );
    console.log(`secondResult: ${JSON.stringify(secondResult)}`);
  }, 10000);
});
