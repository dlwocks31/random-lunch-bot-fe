import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "react-query";

export function useSlackOauthStatus() {
  const session = useSession();
  const { data, isLoading } = useQuery(
    ["slack", "oauth-status", session?.access_token],
    () => fetch("/api/slack/oauth").then((res) => res.json()),
    {
      enabled: !!session,
      staleTime: Infinity,
    },
  );
  return { slackTeamName: data?.teamName, isLoading };
}
