import { Button } from "@mui/material";
import { ceil } from "lodash";
import { useEffect } from "react";
import { SlackUser } from "../../utils/slack/slack-user";

export function GroupCountEditor({
  eachGroupSize,
  groupCount,
  users,
  setGroupCount,
}: {
  eachGroupSize: number;
  groupCount: number;
  users: SlackUser[];
  setGroupCount: (groupCount: number) => void;
}) {
  useEffect(() => {
    setGroupCount(ceil(users.length / eachGroupSize));
  }, [users.length, eachGroupSize]);
  return (
    <div>
      <div>
        총 {users?.length}명의 유저가 {groupCount}개의 조로 추첨됩니다.
      </div>
      <Button
        variant="contained"
        onClick={() =>
          setGroupCount(
            groupCount < users.length ? groupCount + 1 : users.length,
          )
        }
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
  );
}
