import { FlexApiService } from "./FlexApiService";
import { FlexService } from "./FlexService";

describe("FlexService", () => {
  it("service test", async () => {
    const sut = new FlexService(new FlexApiService(""));
    const result = await sut.getUserByWorkingStatus("2022-05-26", "13:00");
    console.log(JSON.stringify(result, null, 2));
  });
});
