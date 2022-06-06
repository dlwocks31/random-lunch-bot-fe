import { supabase } from "../supabase/supabaseClient";
import { SlackService } from "./slack.service";

export async function SlackServiceFactory() {
  // TODO: server side에서만 돌도록 리팩토링 필요
  const { data } = await supabase
    .from("slack_oauth_tokens")
    .select("access_token")
    .single();
  const accessToken = data.access_token;
  return new SlackService(accessToken);
}
