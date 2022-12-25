import { NextApiRequest, NextApiResponse } from "next";
import { SlackServiceFactory } from "../../../utils/slack/SlackServiceFactory";
import { supabase } from "../../../utils/supabase/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (accessToken === undefined) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  supabase.auth.setAuth(accessToken);
  const slackService = await SlackServiceFactory();
  const users = await slackService.findAllValidSlackUsers();
  res.status(200).json(users);
}
