import { Box, Chip, TextField } from "@mui/material";
import { useState } from "react";
import Select from "react-select";
import { TagMap } from "../../utils/domain/TagMap";
import { NormalUser } from "../../utils/slack/NormalUser";

export const TagEditor = ({
  users,
  tagMap,
  setTagMap,
}: {
  users: NormalUser[];
  tagMap: TagMap;
  setTagMap: (tagMap: TagMap) => void;
}) => {
  const [newTagName, setNewTagName] = useState("");
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <div>
        같은 종류의 태그에 속한 사람은, 최대한 같은 조로 편성되지 않습니다.
      </div>
      <Box display="flex" alignItems="center" gap={1}>
        <div>태그 종류 추가하기:</div>
        <TextField
          label="태그 이름"
          size="small"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setTagMap(tagMap.setNewTag(newTagName));
              setNewTagName("");
            }
          }}
        />
      </Box>
      <Box display="flex" flexDirection="column" gap={1}>
        {Object.entries(tagMap.tagToUserIdsMap()).map(([tag, userIds]) => (
          <Box key={tag} display="flex" gap={1}>
            <Chip label={tag} />
            <Select
              isMulti
              options={users.map(({ id, name }) => ({
                value: id,
                label: name,
              }))}
              value={userIds.map((id) => {
                const user = users.find((u) => u.id === id);
                return {
                  value: id,
                  label: user?.name || "",
                };
              })}
              onChange={(e) => {
                const userIds = e.map((e) => e.value);
                setTagMap(tagMap.setUserIdsOfTag(tag, userIds));
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
