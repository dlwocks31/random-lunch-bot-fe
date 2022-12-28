import { NextApiRequest, NextApiResponse } from "next";
import { SlackServiceFactory } from "../../../utils/slack/SlackServiceFactory";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (accessToken === undefined) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  // TODO set session
  const slackService = await SlackServiceFactory();

  const channel = req.query.channel as string;
  const memberIds = await slackService.getConversationMembers(channel);
  res.status(200).json(memberIds);
}
