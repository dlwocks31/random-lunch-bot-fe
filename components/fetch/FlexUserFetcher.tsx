import { Button } from "@mui/material";
import { LunchUser } from "../../utils/domain/LunchUser";
import { SlackUser } from "../../utils/slack/slack-user";

export function FlexUserFetcher({
  users,
  setUsers,
}: {
  users: LunchUser[];
  setUsers: (users: LunchUser) => void;
}) {
  return users.length === 0 ? null : (
    <div>
      <Button>Import setting from Flex(NOP) </Button>
    </div>
  );
}
