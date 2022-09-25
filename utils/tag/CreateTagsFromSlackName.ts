export function createTagsFromSlackName(name: string): string[] {
  const pattern = /[ \[]+/;
  const matched = name.match(pattern);
  if (!matched || !matched.index) return [];
  // take string after the matched pattern
  const str = name.substring(matched.index + matched[0].length);
  return str
    .split(/[\[\]//_]/)
    .filter((s) => s !== "")
    .map((s) => s.trim().replaceAll(" ", "").toUpperCase());
}
