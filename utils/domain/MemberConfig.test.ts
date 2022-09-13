import { NormalUser } from "../slack/NormalUser";
import { SlackUser } from "../slack/slack-user";
import { MemberConfig } from "./MemberConfig";

describe("MemberConfig", () => {
  it("주어진 슬랙 유저들을 모두 출근 조에 넣은 조 구성을 만들 수 있다.", () => {
    const users: NormalUser[] = [
      NormalUser.fromSlackUser(
        new SlackUser("U01", "user1", "user@user.com", "", ""),
      ),
    ];
    const config = MemberConfig.initializeFromUsers(users);
    expect(config.office.groups[0]).toEqual(users);
  });
});
