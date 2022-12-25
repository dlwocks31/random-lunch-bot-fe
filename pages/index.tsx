import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { SupabaseSlackAuthBar } from "../components/auth/SupabaseSlackAuthBar";
import { MainGroupComopnent } from "../components/main/MainGroupComponent";
import { MemberConfig } from "../utils/domain/MemberConfig";
import { MemberPartition } from "../utils/domain/MemberPartition";
import { SlackConversation } from "../utils/domain/SlackConversation";
import { TagMap } from "../utils/domain/TagMap";
import { NormalUser } from "../utils/slack/NormalUser";
import { supabase } from "../utils/supabase/supabaseClient";
import { generateTags } from "../utils/tag/GenerateTags";
const DEFAULT_EACH_GROUP_USER = 4;
export default function V2() {
  const [slackInstalled, setSlackInstalled] = useState(false);
  const [conversations, setConversations] = useState<SlackConversation[]>([]);
  const [members, setMembers] = useState<MemberConfig>(
    new MemberConfig(
      new MemberPartition([], DEFAULT_EACH_GROUP_USER),
      new MemberPartition([], DEFAULT_EACH_GROUP_USER),
      [],
    ),
  );
  const [tagMap, setTagMap] = useState<TagMap>(new TagMap([]));

  const { data: usersData } = useQuery(
    ["slack", "users"],
    async () =>
      fetch("/api/slack/users", {
        headers: {
          Authorization: `Bearer ${supabase.auth.session()?.access_token}`,
        },
      }).then((res) => res.json()),
    {
      enabled: slackInstalled,
      staleTime: Infinity,
    },
  );

  const initialUsers = usersData?.map(NormalUser.fromSlackUser);

  useEffect(() => {
    if (usersData) {
      const normalUsers = usersData.map(NormalUser.fromSlackUser);
      const newTagMap = new TagMap(generateTags(normalUsers));
      setTagMap(newTagMap);
      setMembers(
        MemberConfig.initializeFromUsers(normalUsers).shuffleByTagMap(
          newTagMap,
        ),
      );
    }
  }, [usersData]);

  const { data: conversationData } = useQuery(
    ["slack", "conversations"],
    async () =>
      fetch("/api/slack/conversations", {
        headers: {
          Authorization: `Bearer ${supabase.auth.session()?.access_token}`,
        },
      }).then((res) => res.json()),
    {
      enabled: slackInstalled,
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

  return (
    <>
      <SupabaseSlackAuthBar setSlackInstalled={setSlackInstalled} />
      <div className="content-container">
        <MainGroupComopnent
          initialUsers={initialUsers}
          members={members}
          setMembers={setMembers}
          conversations={conversations}
          tagMap={tagMap}
          setTagMap={setTagMap}
        />
      </div>
      <style jsx>{`
        .content-container {
          margin: 8px 12px;
        }
      `}</style>
    </>
  );
}
