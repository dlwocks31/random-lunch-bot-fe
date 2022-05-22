import { createTagsFromSlackName } from "./CreateTagsFromSlackName";

describe("CreateTagsFromSlackName", () => {
  test.each([
    ["구미향[BE]", ["BE"]],
    ["이재찬[BE/C2C TF]", ["BE", "C2CTF"]],
    ["양승혜[피플앤컬처 리드]", ["피플앤컬처리드"]],
    ["손영철[BE / Contract Build Up TF]", ["BE", "ContractBuildUpTF"]],
    ["이상범 COO/[LEAD PO]/운영개선 TF", ["COO", "LEADPO", "운영개선TF"]],
    ["이정희[BE]운영개선TF", ["BE", "운영개선TF"]],
    ["가은 [교육상품기획]", ["교육상품기획"]],
    [
      "김건희[PD/B2CTF 문제정의TF 북극성TF]",
      ["PD", "B2CTF", "문제정의TF", "북극성TF"],
    ],
  ])('이름 "%s" 은 %s 부서에 해당한다.', (input: string, output) => {
    const actual = createTagsFromSlackName(input);
    expect(actual).toEqual(output);
  });
});
