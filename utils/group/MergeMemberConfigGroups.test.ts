import { MemberConfig } from "../domain/MemberConfig";
import { MemberPartition } from "../domain/MemberPartition";
import { NormalUser } from "../slack/NormalUser";
import { mergeMemberConfigGroups } from "./MergeMemberConfigGroups";

describe("MergeMeberConfigGroups", () => {
  it("사무실과 재택 조원을 합쳐서, 메세지로 나갈 있는 포맷으로 만든다.", () => {
    const memberConfig = new MemberConfig(
      new MemberPartition(
        [
          [new NormalUser("office-a"), new NormalUser("office-b")],
          [new NormalUser("office-c"), new NormalUser("office-d")],
        ],
        4,
      ),
      new MemberPartition(
        [[new NormalUser("remote-a"), new NormalUser("remote-b")]],
        4,
      ),
      [],
    );

    const groups = mergeMemberConfigGroups(memberConfig);

    expect(groups).toEqual([
      {
        groupLabel: "1조",
        users: [new NormalUser("office-a"), new NormalUser("office-b")],
      },
      {
        groupLabel: "2조",
        users: [new NormalUser("office-c"), new NormalUser("office-d")],
      },
      {
        groupLabel: "3조",
        users: [new NormalUser("remote-a"), new NormalUser("remote-b")],
      },
    ]);
  });
});
