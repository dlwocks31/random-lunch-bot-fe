import { groupUsersFromRawTags } from "./GroupUsersFromRawTag";

describe("GroupUsersFromRawTag", () => {
  it("최초 추출된 태그가 완전히 같으면 잘 묶인다", () => {
    const input = [
      { userId: "1", rawTags: ["BE"] },
      { userId: "2", rawTags: ["BE"] },
    ];

    const result = groupUsersFromRawTags(input);

    expect(result).toEqual([
      {
        tag: "BE",
        userIds: ["1", "2"],
      },
    ]);
  });

  it("최초 추출된 태그가 하나라도 겹치면 해당 태그로 묶인다", () => {
    const input = [
      { userId: "1", rawTags: ["BE"] },
      { userId: "2", rawTags: ["BE", "SomeAnotherTag"] },
    ];

    const result = groupUsersFromRawTags(input);

    expect(result).toEqual([
      {
        tag: "BE",
        userIds: ["1", "2"],
      },
    ]);
  });

  it("최초 추출된 태그가 하나라도 겹치면 해당 태그로 묶인다", () => {
    const input = [
      { userId: "1", rawTags: ["오작교파트"] },
      { userId: "2", rawTags: ["오작교파트", "SomeAnotherTag"] },
      { userId: "3", rawTags: ["오작교파트", "RandomTag"] },
    ];

    const result = groupUsersFromRawTags(input);

    expect(result).toEqual([
      {
        tag: "오작교파트",
        userIds: ["1", "2", "3"],
      },
    ]);
  });

  it("태그의 앞부분만 겹치는 유저도 같은 태그로 묶을 수 있다", () => {
    const input = [
      { userId: "1", rawTags: ["매칭사업팀Lead"] },
      { userId: "2", rawTags: ["매칭매니저 인턴"] },
      { userId: "3", rawTags: ["매칭매니저"] },
      { userId: "4", rawTags: ["매칭파트리드"] },
      { userId: "A", rawTags: ["교육운영 인턴"] },
      { userId: "B", rawTags: ["교육운영"] },
      { userId: "C", rawTags: ["교육사업 리드"] },
      { userId: "D", rawTags: ["교육운영파트 리드"] },
    ];

    const result = groupUsersFromRawTags(input);

    expect(result).toEqual([
      {
        tag: "매칭",
        userIds: ["1", "2", "3", "4"],
      },
      {
        tag: "교육",
        userIds: ["A", "B", "C", "D"],
      },
    ]);
  });
});
