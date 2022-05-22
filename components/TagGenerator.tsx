import { Button } from "@mui/material";
import { SlackUser } from "../utils/slack/slack-user";
import { createCommonTokens } from "../utils/tag/CreateCommonTokens";
import { createTagsFromSlackName } from "../utils/tag/CreateTagsFromSlackName";

export function TagGenerator({
  users,
  onTagMapChange,
}: {
  users: SlackUser[];
  onTagMapChange: (tagMap: Map<string, string[]>) => void;
}) {
  const generateTag = () => {
    const newTagMap: Map<string, string[]> = new Map();
    const allRawTags = [];
    for (const user of users) {
      allRawTags.push(...createTagsFromSlackName(user.displayName));
    }
    const commonTokens = createCommonTokens(allRawTags);
    console.log(`Common tokens: ${commonTokens}`);
    for (const user of users) {
      const rawTags = createTagsFromSlackName(user.displayName);
      const tags = rawTags.map((tag) => {
        const token = commonTokens.find((t) => tag.includes(t));
        return token ? token : tag;
      });
      for (const tag of tags) {
        const userIds = newTagMap.get(tag) || [];
        userIds.push(user.id);
        newTagMap.set(tag, userIds);
      }
    }
    // remove tag with only one person
    for (const [tag, userIds] of newTagMap.entries()) {
      if (userIds.length <= 1) {
        newTagMap.delete(tag);
      }
    }
    // uniqueize each userId list
    for (const [tag, userIds] of newTagMap.entries()) {
      newTagMap.set(tag, [...new Set(userIds)]);
    }
    onTagMapChange(newTagMap);
  };
  return (
    <div>
      <Button variant="contained" onClick={generateTag}>
        이름에서 태그 생성하기
      </Button>
    </div>
  );
}
