import { NextApiRequest, NextApiResponse } from "next";
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
  // TODO set session

  const { data } = await supabase.from("slack_oauth_tokens").select().single();

  const teamName = data?.raw_oauth_response?.team.name;
  res.status(200).json({ teamName });
}
