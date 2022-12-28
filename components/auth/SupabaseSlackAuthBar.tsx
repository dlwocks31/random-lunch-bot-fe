import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import {
  useSession,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { AddToSlackButton } from "./AddToSlackButton";
import { LoginDialog } from "./LoginDialog";

export function SupabaseSlackAuthBar({
  setSlackInstalled,
}: {
  setSlackInstalled: (slackInstalled: boolean) => void;
}) {
  const [oauthStatus, setOauthStatus] = useState<{ team: string } | null>(null);
  const session = useSession();

  const user = useUser();
  const isAnonUser = !user;
  async function queryOauthStatus() {
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

  useEffect(() => {
    if (session) {
      queryOauthStatus();
    }
  }, [session]);

  const isSlackAdded = oauthStatus !== null;
  const supabaseClient = useSupabaseClient();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>두런두런치 봇</Typography>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {user ? (
            <>
              <div>로그인 되었습니다. {user?.email}</div>
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
          ) : (
            <>
              <div>
                <LoginDialog
                  handleLogin={(email, password) => {
                    supabaseClient.auth
                      .signInWithPassword({ email, password })
                      .then(queryOauthStatus);
                  }}
                />
              </div>
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
