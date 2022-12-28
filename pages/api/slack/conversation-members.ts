import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";
import { SlackServiceFactory } from "../../../utils/slack/SlackServiceFactory";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const slackService = await SlackServiceFactory(supabase);

  const channel = req.query.channel as string;
  const memberIds = await slackService.getConversationMembers(channel);
  res.status(200).json(memberIds);
}
