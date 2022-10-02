import { createCommonTokens } from "./CreateCommonTokens";

describe("CreateCommonTokens", () => {
  test.each([
    [["매칭매니저", "매칭팀 Lead"], ["매칭"]],
    [["AA", "BB", "CC"], []],
    [["피플앤컬처리드", "피플매니저"], ["피플"]],
    [["CX리드", "CX"], ["CX"]],
    [["사업개발팀리드", "사업개발"], ["사업"]],
  ])(
    "Tag로 %p가 주어지면 그 안에서 %p 추출",
    (tags: string[], output: string[]) => {
      const actual = createCommonTokens(tags);
      expect(new Set(actual)).toEqual(new Set(output));
    },
  );
});
