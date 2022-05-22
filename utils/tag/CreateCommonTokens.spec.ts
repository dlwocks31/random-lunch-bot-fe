import { createCommonTokens } from "./CreateCommonTokens";

describe("CreateCommonTokens", () => {
  test.each([
    [["매칭매니저", "매칭팀 Lead"], ["매칭"]],
    [["브랜드마케팅", "CRM마케터"], ["마케"]],
    [["AA", "BB", "CC"], []],
    [["피플앤컬처리드", "피플매니저"], ["피플"]],
    [["CX리드", "CX"], ["CX"]],
    [["C2CTF", "B2CTF"], []],
    [["사업개발팀리드", "사업개발"], ["사업"]],
    [["B2CTF", "B2CTF", "C2CTF"], []],
    [["북극성TF", "북극성TF"], []],
    [["B2CTF", "B2B영업"], []],
    [["CTO", "B2CTF"], []],
  ])(
    "Tag로 %p가 주어지면 그 안에서 %p 추출",
    (tags: string[], output: string[]) => {
      const actual = createCommonTokens(tags);
      expect(new Set(actual)).toEqual(new Set(output));
    },
  );
});