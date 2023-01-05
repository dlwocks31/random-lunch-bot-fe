import { Box } from "@mui/material";
import { NormalUser } from "../../utils/slack/NormalUser";
import { MentionedUser } from "./MentionedUser";

export const MentionedUserGroup = ({
  memberGroup,
}: {
  memberGroup: {
    groupLabel: string;
    users: NormalUser[];
  };
}) => (
  <Box display="flex" alignItems="center" key={memberGroup.groupLabel}>
    <span style={{ whiteSpace: "nowrap" }}>{memberGroup.groupLabel}:</span>
    {memberGroup.users.map((user) => (
      <MentionedUser name={user.name} key={user.name} />
    ))}
  </Box>
);
