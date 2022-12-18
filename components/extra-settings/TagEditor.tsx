import { Chip, TextField } from "@mui/material";
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
    <>
      <div>
        <div>Tags: </div>
        {Object.entries(tagMap.tagToUserIdsMap()).map(([tag, userIds]) => (
          <div key={tag} className="each-tag-container">
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
          </div>
        ))}
      </div>
      <div className="new-tag-container">
        <div>태그 이름 추가하기:</div>
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
      </div>
      <style jsx>{`
        .new-tag-container {
          display: flex;
        }
        .each-tag-container {
          display: flex;
          gap: 10px;
        }
        .tag-preview {
          display: flex;
          align-items: center;
          gap: 2px;
        }
      `}</style>
    </>
  );
};
