import { Box } from "@mui/material";
import { NormalUser } from "../../utils/slack/NormalUser";

export const UnmentionedUserGroup = ({
  memberGroup,
}: {
  memberGroup: {
    groupLabel: string;
    users: NormalUser[];
  };
}) => (
  <Box display="flex" alignItems="center" key={memberGroup.groupLabel}>
    {memberGroup.groupLabel}:{" "}
    {memberGroup.users.map((user) => user.name).join(" ")}
  </Box>
);
