import { Box } from "@mui/material";
import { useSession } from "@supabase/auth-helpers-react";
import { SlackSvg } from "../util/SlackSvg";

function encodeData(data: any) {
  return Object.keys(data)
    .map(function (key) {
      return [key, data[key]].map(encodeURIComponent).join("=");
    })
    .join("&");
}
const SLACK_CALLBACK_HOST = process.env.NEXT_PUBLIC_SLACK_OAUTH_CALLBACK_HOST;
export const SLACK_CALLBACK_BASE_QUERY = {
  scope:
    "channels:read,chat:write,chat:write.public,users:read,users:read.email",
  redirect_uri: `${SLACK_CALLBACK_HOST}/api/slack/callback`,
  client_id: process.env.NEXT_PUBLIC_SLACK_BOT_CLIENT_ID,
};

export function AddToSlackButton() {
  const session = useSession();
  function getCallbackUrl() {
    return `https://slack.com/oauth/v2/authorize?${encodeData({
      ...SLACK_CALLBACK_BASE_QUERY,
      state: JSON.stringify({
        session: {
          access_token: session?.access_token,
          refresh_token: session?.refresh_token,
        },
      }),
    })}`;
  }
  return (
    <>
      <a href={getCallbackUrl()} className="slack-a-button">
        <SlackSvg />
        <Box marginLeft={1}>슬랙 앱 추가</Box>
      </a>
      <style jsx>
        {`
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
        `}
      </style>
    </>
  );
}
