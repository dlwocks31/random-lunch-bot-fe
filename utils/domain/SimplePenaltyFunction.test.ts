import { NormalUser } from "../slack/NormalUser";
import { simplePenaltyFunction } from "./SimplePenaltyFunction";

describe("SimplePenaltyFunction", () => {
  it("같은 태그가 있으면 페널티가 있음", () => {
    const team = [
      new NormalUser("U1"),
      new NormalUser("U2"),
      new NormalUser("U3"),
    ];

    const userIdToTagsMap = {
      U1: ["T1"],
      U2: ["T1"],
      U3: ["T3"],
    };

    const penalty = simplePenaltyFunction(team, userIdToTagsMap);
    expect(penalty).toBe(1);
  });

  it("같은 태그가 없으면 페널티가 없음", () => {
    const team = [
      new NormalUser("U1"),
      new NormalUser("U2"),
      new NormalUser("U3"),
    ];

    const userIdToTagsMap = {
      U1: ["T1"],
      U2: ["T2"],
      U3: ["T3"],
    };

    const penalty = simplePenaltyFunction(team, userIdToTagsMap);
    expect(penalty).toBe(0);
  });
});
