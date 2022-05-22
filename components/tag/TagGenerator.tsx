import { Button } from "@mui/material";
import { useEffect } from "react";
import { SlackUser } from "../../utils/slack/slack-user";
import { createCommonTokens } from "../../utils/tag/CreateCommonTokens";
import { createTagsFromSlackName } from "../../utils/tag/CreateTagsFromSlackName";

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
    const allTags = allRawTags
      .filter((tag) => !commonTokens.some((token) => tag.includes(token)))
      .concat(commonTokens);

    for (const tag of allTags) {
      newTagMap.set(tag, []);
    }

    for (const user of users) {
      const rawTags = createTagsFromSlackName(user.displayName);
      for (const tag of rawTags) {
        for (const addToTags of allTags) {
          if (tag.includes(addToTags)) {
            const userIds = newTagMap.get(addToTags) || [];
            userIds.push(user.id);
            newTagMap.set(addToTags, userIds);
          }
        }
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

  useEffect(generateTag, [users.length]);
  return (
    <div>
      <Button variant="contained" onClick={generateTag}>
        이름에서 태그 생성하기
      </Button>
    </div>
  );
}
