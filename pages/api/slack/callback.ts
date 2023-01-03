import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { SLACK_CALLBACK_BASE_QUERY } from "../../../components/auth/AddToSlackButton";

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const supabase = createServerSupabaseClient({ req, res });
  await supabase.auth.setSession(JSON.parse(req.query.state as string).session);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const code = req.query.code as string;

  const oauthResponseData = (
    await axios.post(
      "https://slack.com/api/oauth.v2.access",
      `client_id=${process.env.NEXT_PUBLIC_SLACK_BOT_CLIENT_ID}&client_secret=${
        process.env.SLACK_BOT_CLIENT_SECRET
      }&code=${code}&redirect_uri=${encodeURIComponent(
        SLACK_CALLBACK_BASE_QUERY.redirect_uri,
      )}`,
    )
  ).data;
  const botAccessToken = oauthResponseData.access_token;

  await supabase
    .from("slack_oauth_tokens")
    .upsert(
      { access_token: botAccessToken, raw_oauth_response: oauthResponseData },
      { onConflict: "user_id" },
    );

  res.redirect(
    process.env.NEXT_PUBLIC_REDIRECT_BACK_HOST || "http://localhost:3000",
  );
};
