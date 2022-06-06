import { useEffect, useState } from "react";
import { URLSearchParams } from "url";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../utils/supabase/supabaseClient";

function encodeData(data: any) {
  return Object.keys(data)
    .map(function (key) {
      return [key, data[key]].map(encodeURIComponent).join("=");
    })
    .join("&");
}
const SLACK_CALLBACK_HOST = "https://aca7-117-111-10-7.ngrok.io";
export const SLACK_CALLBACK_BASE_QUERY = {
  scope: "channels:join,chat:write,users:read,users:read.email,channels:read",
  redirect_uri: `${SLACK_CALLBACK_HOST}/api/auth/callback`,
  client_id: "724758129958.3531603815618",
};

export function SupabaseAnonAuth() {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const currentUser = supabase.auth.user();
    if (!currentUser) {
      const email = `${uuidv4()}@anon-login.com`;
      const password = uuidv4();
      supabase.auth
        .signUp({ email, password })
        .then(({ user }) => setUserEmail(user?.email || ""));
    } else {
      setUserEmail(currentUser.email || "");
      supabase
        .from("slack_oauth_tokens")
        .select("*")
        .then((queryData) =>
          console.log(`queryData: ${JSON.stringify(queryData)}`),
        );
    }
  });

  function getCallbackUrl() {
    return `https://slack.com/oauth/v2/authorize?${encodeData({
      ...SLACK_CALLBACK_BASE_QUERY,
      state: JSON.stringify({
        supabaseAccessToken: supabase.auth.session()?.access_token,
      }),
    })}`;
  }

  return (
    <div>
      <div>Current User: {userEmail}</div>
      {userEmail && (
        <a href={getCallbackUrl()} className="slack-a-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="slack-svg"
            viewBox="0 0 122.8 122.8"
          >
            <path
              d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
              fill="#e01e5a"
            ></path>
            <path
              d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
              fill="#36c5f0"
            ></path>
            <path
              d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
              fill="#2eb67d"
            ></path>
            <path
              d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
              fill="#ecb22e"
            ></path>
          </svg>
          Add to Slack
        </a>
      )}
      <style jsx>{`
        .slack-a-button {
          align-items: center;
          color: #000;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 44px;
          display: inline-flex;
          font-family: Lato, sans-serif;
          font-size: 14px;
          font-weight: 600;
          height: 44px;
          justify-content: center;
          text-decoration: none;
          width: 204px;
        }
        .slack-svg {
          height: 16px;
          width: 16px;
          margin-right: 12px;
        }
      `}</style>
    </div>
  );
}
