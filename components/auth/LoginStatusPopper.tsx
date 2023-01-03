import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Popper,
} from "@mui/material";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRef, useState } from "react";
import { useSlackOauthStatus } from "../../utils/hooks/UseSlackOauthStatus";
export const LoginStatusPopper = ({}) => {
  // Reffered to https://mui.com/material-ui/react-button-group/#split-button

  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen((prev) => !prev);

  const user = useUser();
  const { slackTeamName } = useSlackOauthStatus();
  const supabaseClient = useSupabaseClient();

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };
  return (
    <div>
      <ButtonGroup variant="outlined" color="inherit" ref={anchorRef}>
        <Button onClick={toggleOpen} sx={{ textTransform: "none" }}>
          <AccountCircleIcon sx={{ marginRight: 1 }} />
          <div>{user?.email}</div>
        </Button>
        <Button size="small" onClick={toggleOpen}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current}>
        <ClickAwayListener onClickAway={handleClose}>
          <Box
            boxShadow="rgb(0 0 0 / 10%) 0px 0px 16px"
            margin={1}
            p={1}
            borderRadius={1}
            bgcolor="white"
          >
            <ButtonGroup variant="text" orientation="vertical" fullWidth>
              <Button sx={{ textTransform: "none" }}>
                슬랙 워크스페이스: {slackTeamName}
              </Button>
              <Button onClick={() => supabaseClient.auth.signOut()}>
                로그아웃
              </Button>
            </ButtonGroup>
          </Box>
        </ClickAwayListener>
      </Popper>
    </div>
  );
};
