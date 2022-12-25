import { NextApiRequest, NextApiResponse } from "next";
import { SlackServiceFactory } from "../../../utils/slack/SlackServiceFactory";
import { supabase } from "../../../utils/supabase/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
  }
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (accessToken === undefined) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  supabase.auth.setAuth(accessToken);
  const slackService = await SlackServiceFactory();
  const message = req.body.message;
  const channel = req.body.channel;
  console.log(`Sending message to channel ${channel}: ${message}`);
  const joinResult = await slackService.joinConversation(channel);
  console.log(JSON.stringify(joinResult));
  const response = await slackService.send(message, channel);
  console.log(JSON.stringify(response));
  res.status(200).json(response);
}
