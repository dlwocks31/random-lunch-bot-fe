import { createTagsFromSlackName } from "./CreateTagsFromSlackName";

describe("CreateTagsFromSlackName", () => {
  test.each([
    ["구미향[BE]", ["BE"]],
    ["이재찬[BE/C2C TF]", ["BE", "C2CTF"]],
    ["양승혜[피플앤컬처 리드]", ["피플앤컬처리드"]],
    ["이정희[BE/제품팀/패스파인더파트]", ["BE", "제품팀", "패스파인더파트"]],
    ["가은 [교육상품기획]", ["교육상품기획"]],
    [
      "손현태[CTO/시터정산_데이터드리븐파트]",
      ["CTO", "시터정산", "데이터드리븐파트"],
    ],
  ])('이름 "%s" 은 %s 부서에 해당한다.', (input: string, output) => {
    const actual = createTagsFromSlackName(input);
    expect(actual).toEqual(output);
  });
});
