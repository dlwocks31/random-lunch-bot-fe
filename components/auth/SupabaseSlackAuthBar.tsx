import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { AddToSlackButton } from "./AddToSlackButton";
import { LoginDialog } from "./LoginDialog";

export function SupabaseSlackAuthBar({
  setSlackInstalled,
}: {
  setSlackInstalled: (slackInstalled: boolean) => void;
}) {
  const [userEmail, setUserEmail] = useState("");
  const [oauthStatus, setOauthStatus] = useState<{ team: string } | null>(null);
  const isAnonUser = !userEmail;
  async function queryOauthStatus(accessToken: string) {
    fetch("/api/slack/oauth")
      .then((res) => res.json())
      .then(({ teamName }: { teamName: string }) => {
        if (teamName) {
          setOauthStatus({ team: teamName });
          setSlackInstalled(true);
        } else {
          setOauthStatus(null);
          setSlackInstalled(false);
        }
      });
  }

  const isSlackAdded = oauthStatus !== null;
  const supabaseClient = useSupabaseClient();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>두런두런치 봇</Typography>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isAnonUser ? (
            <>
              <div>
                <LoginDialog
                  handleLogin={(email, password) => {
                    supabaseClient.auth
                      .signInWithPassword({ email, password })
                      .then(() => supabaseClient.auth.getSession())
                      .then((session) => {
                        setUserEmail(email);
                        queryOauthStatus(
                          session.data.session?.access_token || "",
                        );
                      });
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div>로그인 되었습니다. {userEmail}</div>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() =>
                  supabaseClient.auth.signOut().then(() => {
                    setOauthStatus(null);
                  })
                }
              >
                로그아웃
              </Button>
            </>
          )}
          {isSlackAdded ? (
            <div>슬랙 워크스페이스: {oauthStatus.team}</div>
          ) : (
            <AddToSlackButton />
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
