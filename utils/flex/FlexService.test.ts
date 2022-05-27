import { FlexService } from "./FlexService";

describe("FlexService", () => {
  it("should create an instance", async () => {
    const flexUid = "";
    const sut = new FlexService(flexUid);
    const ids = await sut.getDepartmentIds();
    console.log(`ids: ${ids}`);
    const result = await sut.searchSimpleUsers(ids);
    console.log(`result: ${result.map((r) => [r.email, r.flexId])}`);

    const users = result.filter((r) => r.email.includes("ce.kim"));
    const secondResult = await sut.getWorkSchedules(
      users.map((u) => u.flexId),
      "2022-05-27",
    );
    console.log(`secondResult: ${JSON.stringify(secondResult)}`);
  }, 10000);
});
