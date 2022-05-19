import { Chip } from "@mui/material";
import { SlackUser } from "../utils/slack/slack-user";

export function UnselectedUserViewer({ users }: { users: SlackUser[] }) {
  return (
    <div>
      <div> Unselected User: </div>
      {users.map((u) => (
        <Chip label={u.displayName} />
      ))}
    </div>
  );
}
