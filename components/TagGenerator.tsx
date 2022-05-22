import { Button } from "@mui/material";
import { SlackUser } from "../utils/slack/slack-user";
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
    for (const user of users) {
      const tags = createTagsFromSlackName(user.displayName);
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
