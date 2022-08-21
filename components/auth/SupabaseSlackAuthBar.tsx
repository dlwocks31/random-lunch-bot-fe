import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../utils/supabase/supabaseClient";
import { AddToSlackButton } from "./AddToSlackButton";
import { LoginDialog } from "./LoginDialog";

export function SupabaseSlackAuthBar({
  setSlackInstalled,
}: {
  setSlackInstalled: (slackInstalled: boolean) => void;
}) {
  const [userEmail, setUserEmail] = useState("");
  const [oauthStatus, setOauthStatus] = useState<{ team: string } | null>(null);
  const [supabaseAccessToken, setSupabaseAccessToken] = useState("");
  const isAnonUser = userEmail.endsWith("@anon-login.com");
  async function queryOauthStatus() {
    // TODO: API call로 변경 (oauth Token을 client에게 숨겨야 함)
    const { data } = await supabase
      .from("slack_oauth_tokens")
      .select()
      .single();

    const teamName = data?.raw_oauth_response?.team.name;
    if (teamName) {
      setOauthStatus({ team: teamName });
      setSlackInstalled(true);
    } else {
      setOauthStatus(null);
      setSlackInstalled(false);
    }
  }

  function signUpAnonUser() {
    const currentUser = supabase.auth.user();
    console.log("currentUser is", currentUser);
    if (!currentUser) {
      const email = `${uuidv4()}@anon-login.com`;
      const password = uuidv4();
      supabase.auth.signUp({ email, password }).then(({ user }) => {
        setUserEmail(user?.email || "");
        setSupabaseAccessToken(supabase.auth.session()?.access_token || "");
        queryOauthStatus();
      });
    } else {
      setUserEmail(currentUser.email || "");
      setSupabaseAccessToken(supabase.auth.session()?.access_token || "");
      if (oauthStatus === null) {
        queryOauthStatus();
      }
    }
  }
  useEffect(signUpAnonUser);

  const isSlackAdded = oauthStatus !== null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>My Lunch Bot</Typography>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isAnonUser ? (
            <>
              <div>미로그인 상태입니다.</div>
              <div>
                <LoginDialog
                  handleLogin={(email, password) => {
                    supabase.auth.signIn({ email, password }).then(() => {
                      setUserEmail(email);
                      queryOauthStatus();
                    });
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div>로그인 되었습니다. Email: {userEmail}</div>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() =>
                  supabase.auth.signOut().then(() => {
                    setOauthStatus(null);
                    signUpAnonUser();
                  })
                }
              >
                로그아웃
              </Button>
            </>
          )}
          {isSlackAdded ? (
            <div>슬랙 워크스페이스: {oauthStatus.team}</div>
          ) : supabaseAccessToken ? (
            <AddToSlackButton supabaseAccessToken={supabaseAccessToken} />
          ) : null}
        </div>
      </Toolbar>
    </AppBar>
  );
}
