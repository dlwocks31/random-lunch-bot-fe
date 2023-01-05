import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "react-query";

export function useSlackUsers() {
  const session = useSession();
  const { data: slackUsers, isLoading: isLoadingSlackUsers } = useQuery(
    ["slack", "users", session?.access_token],
    async () => fetch("/api/slack/users").then((res) => res.json()),
    {
      enabled: !!session,
      staleTime: Infinity,
    },
  );

  return { slackUsers, isLoadingSlackUsers };
}
