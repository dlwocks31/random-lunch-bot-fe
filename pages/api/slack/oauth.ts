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
  }
  console.log("user", JSON.stringify(user, null, 2));
  const { data } = await supabase.from("slack_oauth_tokens").select().single();

  console.log("data", JSON.stringify(data, null, 2));
  const teamName = data?.raw_oauth_response?.team.name;
  res.status(200).json({ teamName });
}
