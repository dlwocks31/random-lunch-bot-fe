import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useSlackOauthStatus } from "../../utils/hooks/UseSlackOauthStatus";
import { AddToSlackButton } from "./AddToSlackButton";
import { LoginDialog } from "./LoginDialog";
import { SlackAppInstallDialog } from "./SlackAppInstallDialog";

export function SupabaseSlackAuthBar() {
  const user = useUser();

  const { slackTeamName, isLoading } = useSlackOauthStatus();

  const supabaseClient = useSupabaseClient();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>두런두런치 봇</Typography>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {user ? (
            <>
              <div>로그인 되었습니다. {user?.email}</div>
              {!isLoading && !slackTeamName && <SlackAppInstallDialog />}
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => supabaseClient.auth.signOut()}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <div>
                <LoginDialog
                  handleLogin={(email, password) => {
                    supabaseClient.auth.signInWithPassword({ email, password });
                  }}
                />
              </div>
            </>
          )}
          {slackTeamName ? (
            <div>슬랙 워크스페이스: {slackTeamName}</div>
          ) : (
            <AddToSlackButton />
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
