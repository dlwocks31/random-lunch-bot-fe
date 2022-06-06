import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../utils/supabase/supabaseClient";
import { AddToSlackButton } from "./AddToSlackButton";

export function SupabaseSlackAuth() {
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
    } else {
      setOauthStatus(null);
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

  return (
    <div>
      <div>Current User ID: {userId}</div>
      {userId &&
        (!!oauthStatus ? (
          <div>슬랙 앱이 설치되었습니다. Team: {oauthStatus.team}</div>
        ) : (
          <div className="flex">
            <div>슬랙 앱이 설치되지 않았습니다.</div>
            <AddToSlackButton />
          </div>
        ))}
      <style jsx>{`
        .flex {
          display: flex;
        }
      `}</style>
    </div>
  );
}
