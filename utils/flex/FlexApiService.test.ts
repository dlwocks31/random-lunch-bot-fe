import { FlexApiService } from "./FlexApiService";

describe("FlexApiService", () => {
  it("api test", async () => {
    const flexUid = "795e317a-7816-4f04-8ea7-616753c67204";
    const sut = new FlexApiService(flexUid);
    const ids = await sut.getDepartmentIds();
    console.log(`ids: ${ids}`);
    const result = await sut.searchSimpleUsers(ids);
    console.log(`result: ${result.map((r) => [r.flexId])}`);

    const users = result.filter((r) => ["구민정"].includes(r.name));
    const secondResult = await sut.getWorkSchedules(
      users.map((u) => u.flexId),
      "2022-06-23",
    );
    console.log(`secondResult: ${JSON.stringify(secondResult)}`);
  }, 10000);
});
