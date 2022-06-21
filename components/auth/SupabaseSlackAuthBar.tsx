import { AppBar, Button, TextField, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../utils/supabase/supabaseClient";
import { AddToSlackButton } from "./AddToSlackButton";

export function SupabaseSlackAuthBar({
  setSlackInstalled,
}: {
  setSlackInstalled: (slackInstalled: boolean) => void;
}) {
  const [userEmail, setUserEmail] = useState("");
  const [oauthStatus, setOauthStatus] = useState<{ team: string } | null>(null);

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

  useEffect(() => {
    const currentUser = supabase.auth.user();
    console.log("currentUser is", currentUser);
    if (!currentUser) {
      const email = `${uuidv4()}@anon-login.com`;
      const password = uuidv4();
      supabase.auth.signUp({ email, password }).then(({ user }) => {
        setUserEmail(user?.email || "");
        queryOauthStatus();
      });
    } else {
      setUserEmail(currentUser.email || "");
      if (oauthStatus === null) {
        queryOauthStatus();
      }
    }
  });

  const appBarText: string = userEmail
    ? oauthStatus
      ? `슬랙 앱이 설치되었습니다. Team: ${oauthStatus.team}`
      : "슬랙 앱을 설치해주세요"
    : "로그인";
  const shouldShowAddToSlackButton: boolean = !!userEmail && !oauthStatus;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>My Lunch Bot</Typography>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {userEmail ? (
            <div className="login-data-container">
              <div>로그인 되었습니다. Email: {userEmail}</div>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => supabase.auth.signOut()}
              >
                로그아웃
              </Button>
              <Typography sx={{ flexGrow: 1 }}>{appBarText}</Typography>
              {shouldShowAddToSlackButton && <AddToSlackButton />}
              {userEmail !== "test@test.com" && (
                <Button
                  color="inherit"
                  variant="outlined"
                  onClick={() =>
                    supabase.auth.signIn({
                      email: "test@test.com",
                      password: "qwer1234",
                    })
                  }
                >
                  로그인
                </Button>
              )}
            </div>
          ) : (
            <div>
              <TextField></TextField>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() =>
                  supabase.auth.signUp({
                    email: "test@test.com",
                    password: "test",
                  })
                }
              >
                로그인
              </Button>
            </div>
          )}
        </div>
      </Toolbar>
      <style jsx>{`
        .login-data-container {
          display: flex;
        }
      `}</style>
    </AppBar>
  );
}
