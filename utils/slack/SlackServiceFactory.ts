import { SupabaseClient } from "@supabase/supabase-js";
import { SlackService } from "./slack.service";

export async function SlackServiceFactory(supabaseClient: SupabaseClient) {
  // TODO: server side에서만 돌도록 리팩토링 필요
  const { data } = await supabaseClient
    .from("slack_oauth_tokens")
    .select("access_token")
    .single();
  const accessToken = data?.access_token;
  return new SlackService(accessToken);
}
