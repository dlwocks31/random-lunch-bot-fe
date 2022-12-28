import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";
import { SlackServiceFactory } from "../../../utils/slack/SlackServiceFactory";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
  }

  const slackService = await SlackServiceFactory(supabase);
  const message = req.body.message;
  const channel = req.body.channel;
  console.log(`Sending message to channel ${channel}: ${message}`);
  const joinResult = await slackService.joinConversation(channel);
  console.log(JSON.stringify(joinResult));
  const response = await slackService.send(message, channel);
  console.log(JSON.stringify(response));
  res.status(200).json(response);
}
