import { FlexApiService } from "./FlexApiService";

describe("FlexApiService", () => {
  it("api test", async () => {
    const flexUid = "";
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
