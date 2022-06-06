import { AppBar, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../utils/supabase/supabaseClient";
import { AddToSlackButton } from "./AddToSlackButton";

export function SupabaseSlackAuthBar({
  setSlackInstalled,
}: {
  setSlackInstalled: (slackInstalled: boolean) => void;
}) {
  const [userId, setUserId] = useState("");
  const [oauthStatus, setOauthStatus] = useState<{ team: string } | null>(null);

  async function queryOauthStatus() {
    // TODO: API call로 변경 (oauth Token을 client에게 숨겨야 함)
    const { data } = await supabase
      .from("slack_oauth_tokens")
      .select()
      .single();
    if (data) {
      setOauthStatus({ team: data.raw_oauth_response.team.name });
      setSlackInstalled(true);
    } else {
      setOauthStatus(null);
      setSlackInstalled(false);
    }
  }

  useEffect(() => {
    const currentUser = supabase.auth.user();
    if (!currentUser) {
      const email = `${uuidv4()}@anon-login.com`;
      const password = uuidv4();
      supabase.auth.signUp({ email, password }).then(({ user }) => {
        setUserId(user?.id || "");
        queryOauthStatus();
      });
    } else {
      setUserId(currentUser.id || "");
      queryOauthStatus();
    }
  });

  const appBarText: string = userId
    ? oauthStatus
      ? `슬랙 앱이 설치되었습니다. Team: ${oauthStatus.team}`
      : "슬랙 앱을 설치해주세요"
    : "로그인";
  const shouldShowAddToSlackButton: boolean = !!userId && !oauthStatus;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>My Lunch Bot</Typography>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Typography sx={{ flexGrow: 1 }}>{appBarText}</Typography>
          {shouldShowAddToSlackButton && <AddToSlackButton />}
        </div>
      </Toolbar>
    </AppBar>
  );
}
