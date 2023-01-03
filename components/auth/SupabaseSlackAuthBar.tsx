import { AppBar, Toolbar, Typography } from "@mui/material";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useSlackOauthStatus } from "../../utils/hooks/UseSlackOauthStatus";
import { AddToSlackButton } from "./AddToSlackButton";
import { LoginDialog } from "./LoginDialog";
import { LoginStatusPopper } from "./LoginStatusPopper";

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
              {!isLoading && !slackTeamName && <AddToSlackButton />}
              <LoginStatusPopper />
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
        </div>
      </Toolbar>
    </AppBar>
  );
}
