import { Box, ThemeProvider, createTheme } from "@mui/material";
import { useSession, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { SupabaseSlackAuthBar } from "../components/auth/SupabaseSlackAuthBar";
import { MainGroupComopnent } from "../components/main/MainGroupComponent";
import { MemberConfig } from "../utils/domain/MemberConfig";
import { MemberPartition } from "../utils/domain/MemberPartition";
import { SlackConversation } from "../utils/domain/SlackConversation";
import { TagMap } from "../utils/domain/TagMap";
import { useSlackUsers } from "../utils/hooks/UseSlackUsers";
import { isMomsitterEmail } from "../utils/momsitter/IsMomsitterEmail";
import { NormalUser } from "../utils/slack/NormalUser";
import { generateTags } from "../utils/tag/GenerateTags";
const DEFAULT_EACH_GROUP_USER = 4;
export default function V2() {
  const session = useSession();

  const [conversations, setConversations] = useState<SlackConversation[]>([]);
  const emptyMemberConfig = new MemberConfig(
    new MemberPartition([], DEFAULT_EACH_GROUP_USER),
    new MemberPartition([], DEFAULT_EACH_GROUP_USER),
    [],
  );
  const [members, setMembers] = useState<MemberConfig>(emptyMemberConfig);
  const [tagMap, setTagMap] = useState<TagMap>(new TagMap([]));

  const { slackUsers } = useSlackUsers();

  const initialUsers = slackUsers?.map(NormalUser.fromSlackUser);

  useEffect(() => {
    if (slackUsers) {
      const normalUsers = slackUsers.map(NormalUser.fromSlackUser);
      const newTagMap = new TagMap(generateTags(normalUsers));
      setTagMap(newTagMap);
      setMembers(
        MemberConfig.initializeFromUsers(normalUsers).shuffleByTagMap(
          newTagMap,
        ),
      );
    }
  }, [slackUsers]);

  const { data: conversationData } = useQuery(
    ["slack", "conversations", session?.access_token],
    async () => fetch("/api/slack/conversations").then((res) => res.json()),
    {
      enabled: !!session,
      staleTime: Infinity,
    },
  );

  useEffect(() => {
    if (conversationData) {
      setConversations(
        conversationData
          .filter((c: { membersCount: number }) => c.membersCount > 0)
          .sort((a: { membersCount: number }, b: { membersCount: number }) => {
            return b.membersCount - a.membersCount;
          }),
      );
    }
  }, [conversationData]);

  useEffect(() => {
    if (!session) {
      setMembers(emptyMemberConfig);
      setTagMap(new TagMap([]));
      setConversations([]);
    }
  }, [session]);

  const momsitterTheme = createTheme({
    palette: {
      primary: {
        main: "#FF7000",
        contrastText: "#fff",
      },
    },
  });

  const defaultTheme = createTheme();
  const user = useUser();
  return (
    <ThemeProvider
      theme={isMomsitterEmail(user?.email) ? momsitterTheme : defaultTheme}
    >
      <SupabaseSlackAuthBar />
      <Box margin="8px 12px">
        <MainGroupComopnent
          initialUsers={initialUsers}
          members={members}
          setMembers={setMembers}
          conversations={conversations}
          tagMap={tagMap}
          setTagMap={setTagMap}
        />
      </Box>
    </ThemeProvider>
  );
}
