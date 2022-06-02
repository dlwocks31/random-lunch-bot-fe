import { Button, Chip, Collapse, Modal, TextField } from "@mui/material";
import Select from "react-select";
import { useState } from "react";
import { SlackUser } from "../../utils/slack/slack-user";
import { TagGenerator } from "./TagGenerator";

export function TagEditor({
  users,
  tagMap,
  onTagMapChange,
}: {
  users: SlackUser[];
  tagMap: Map<string, string[]>;
  onTagMapChange: (tagMap: Map<string, string[]>) => void;
}) {
  const [newTagName, setNewTagName] = useState("");
  const [isOpened, setIsOpened] = useState(false);
  return (
    <div>
      <Button variant="contained" onClick={() => setIsOpened((open) => !open)}>
        태그 확인
      </Button>
      <Collapse in={isOpened}>
        <div>
          <div>Tags: </div>
          {Array.from(tagMap.entries()).map(([tag, userIds]) => (
            <div key={tag} className="each-tag-container">
              <Chip label={tag} />
              <Select
                isMulti
                options={users.map(({ id, displayName }) => ({
                  value: id,
                  label: displayName,
                }))}
                value={userIds.map((id) => {
                  const user = users.find((u) => u.id === id);
                  return {
                    value: id,
                    label: user?.displayName || "",
                  };
                })}
                onChange={(e) => {
                  const newTagMap = new Map(tagMap);
                  if (e.length === 0) {
                    newTagMap.delete(tag);
                  } else {
                    newTagMap.set(
                      tag,
                      e.map((e) => e.value),
                    );
                  }
                  onTagMapChange(newTagMap);
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
                const newTagMap = new Map(tagMap);
                newTagMap.set(newTagName, []);
                onTagMapChange(newTagMap);
                setNewTagName("");
              }
            }}
          />
        </div>
        <TagGenerator users={users} onTagMapChange={onTagMapChange} />
        <style jsx>{`
          .new-tag-container {
            display: flex;
          }
          .each-tag-container {
            display: flex;
            gap: 10px;
          }
        `}</style>
      </Collapse>
    </div>
  );
}
