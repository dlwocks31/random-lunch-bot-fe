import {
  Button,
  Chip,
  Collapse,
  Modal,
  TextField,
  Tooltip,
} from "@mui/material";
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
    <div className="root">
      <div className="tag-preview">
        <div>현재 태그: </div>
        {Array.from(tagMap.entries()).map(([key, value]) => (
          <Tooltip
            title={`총 ${value.length}명`}
            onClick={() => setIsOpened((open) => !open)}
            key={key + value.join("-")}
          >
            <Chip key={key} label={key} />
          </Tooltip>
        ))}
      </div>
      <Button variant="outlined" onClick={() => setIsOpened((open) => !open)}>
        태그 상세 정보 {isOpened ? "숨기기" : "보기"}
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
      </Collapse>
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
        .root {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>
    </div>
  );
}
