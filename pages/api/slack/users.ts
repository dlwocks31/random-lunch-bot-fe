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
  }

  const slackService = await SlackServiceFactory(supabase);
  const users = await slackService.findAllValidSlackUsers();
  res.status(200).json(users);
}
