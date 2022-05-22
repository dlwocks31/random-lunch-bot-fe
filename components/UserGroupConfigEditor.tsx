import { Button, TextField } from "@mui/material";
import { SlackUser } from "../utils/slack/slack-user";

export function UserGroupConfigEditor({
  eachGroupSize,
  groupCount,
  users,
  setEachGroupSize,
  setGroupCount,
}: {
  eachGroupSize: number;
  groupCount: number;
  users: SlackUser[];
  setEachGroupSize: (eachGroupSize: number) => void;
  setGroupCount: (groupCount: number) => void;
}) {
  return (
    <div>
      <div>
        <TextField
          label="원하는 조별 인원 수"
          type="number"
          value={eachGroupSize}
          onChange={(e) => {
            if (e.target.value) setEachGroupSize(Number(e.target.value));
          }}
        />
      </div>
      <div className="group-count-container">
        <div>
          총 {users.length}명의 유저가 {groupCount}개의 조로 추첨됩니다!
        </div>
        <Button
          variant="contained"
          onClick={() => setGroupCount(groupCount + 1)}
        >
          조 개수 +1
        </Button>
        <Button
          variant="contained"
          onClick={() =>
            setGroupCount(groupCount > 1 ? groupCount - 1 : groupCount)
          }
        >
          조 개수 -1
        </Button>
      </div>
      <style jsx>
        {`
          .group-count-container {
            display: flex;
          }
        `}
      </style>
    </div>
  );
}
