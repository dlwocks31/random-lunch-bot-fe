import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { SLACK_CALLBACK_BASE_QUERY } from "../../../components/auth/AddToSlackButton";

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const state = JSON.parse(req.query.state as string);
  // TODO 이 엔드포인트가 아직 필요한지 확인 필요

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
  console.log(oauthResponseData);
  const botAccessToken = oauthResponseData.access_token;

  res.redirect(process.env.REDIRECT_BACK_HOST || "http://localhost:3000");
};
