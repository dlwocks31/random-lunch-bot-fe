import { uniq } from "lodash";

export function createCommonTokens(rawTags: string[]): string[] {
  const tags = uniq(rawTags);
  const tokenTags: string[] = [];
  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      const t1 = tags[i];
      const t2 = tags[j];
      if (t1 === t2) continue;
      for (let s = 0; s < t1.length - 1; s++) {
        const tokenCandidate = t1.substring(s, s + 2);
        const foundIndex = t2.indexOf(tokenCandidate);
        if (
          foundIndex === s &&
          !isAlphaAndDigitMixed(tokenCandidate) &&
          (!isASCII(tokenCandidate) || !s)
        ) {
          tokenTags.push(tokenCandidate);
          break;
        }
      }
    }
  }
  return uniq(tokenTags);
}
function isASCII(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str);
}

function isAlphaAndDigitMixed(str: string): boolean {
  return /[A-Z]/.test(str) && /[0-9]/.test(str);
}
