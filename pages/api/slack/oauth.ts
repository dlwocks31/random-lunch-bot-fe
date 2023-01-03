import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

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
  const { data } = await supabase.from("slack_oauth_tokens").select().single();

  const teamName = data?.raw_oauth_response?.team.name;
  res.status(200).json({ teamName });
}
