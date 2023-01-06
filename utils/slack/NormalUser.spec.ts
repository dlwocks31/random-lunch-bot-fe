import { NormalUser } from "./NormalUser";
import { SlackUser } from "./slack-user";

describe("NormalUser", () => {
  describe("nameWithStatus", () => {
    it("이모지가 없으면 이모지 없는 이름이 나온다.", () => {
      const user = new NormalUser("모시깽이");
      expect(user.nameWithStatus).toEqual("모시깽이");
    });

    it("이모지가 있으면 이모지를 변환해서 이름을 보여준다", () => {
      const user = new NormalUser(
        "모시깽이",
        new SlackUser("U01", "모시깽이", "모시깽이", ":palm_tree:", "모시깽이"),
      );
      expect(user.nameWithStatus).toEqual("🌴 모시깽이");
    });
  });
});
