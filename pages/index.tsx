import { sortBy } from "lodash";
import { useEffect, useState } from "react";
import { SupabaseSlackAuthBar } from "../components/auth/SupabaseSlackAuthBar";
import { MainGroupComopnent } from "../components/main/MainGroupComponent";
import { MainMessageComponent } from "../components/main/MainMessageComponent";
import { MemberConfig } from "../utils/domain/MemberConfig";
import { MemberPartition } from "../utils/domain/MemberPartition";
import { SlackConversation } from "../utils/domain/SlackConversation";
import { TagMap } from "../utils/domain/TagMap";
import { NormalUser } from "../utils/slack/NormalUser";
import { SlackServiceFactory } from "../utils/slack/SlackServiceFactory";
import { generateTags } from "../utils/tag/GenerateTags";
const DEFAULT_EACH_GROUP_USER = 4;
export default function V2() {
  const [step, setStep] = useState(0);

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

  const initializeFromSlack = async () => {
    const slackService = await SlackServiceFactory();
    const conversations = await slackService.listConversation();
    const slackUsers = await slackService.findAllValidSlackUsers();
    const users = slackUsers.map(NormalUser.fromSlackUser);
    const newTagMap = new TagMap(generateTags(users));
    setTagMap(newTagMap);
    setMembers(
      MemberConfig.initializeFromUsers(users).shuffleByTagMap(newTagMap),
    );
    setConversations(
      sortBy(
        conversations.filter((c) => c.membersCount > 0),
        (c) => -c.membersCount,
        "name",
      ),
    );
  };

  useEffect(() => {
    if (slackInstalled) {
      initializeFromSlack();
    }
  }, [slackInstalled]);
  return (
    <>
      <SupabaseSlackAuthBar setSlackInstalled={setSlackInstalled} />
      <div className="content-container">
        {step === 0 ? (
          <MainGroupComopnent
            onStepIncrement={() => setStep(1)}
            members={members}
            setMembers={setMembers}
            conversations={conversations}
            tagMap={tagMap}
            setTagMap={setTagMap}
          />
        ) : (
          <MainMessageComponent
            onStepDecrement={() => setStep(0)}
            slackConversations={conversations}
            members={members}
          />
        )}
      </div>
      <style jsx>{`
        .content-container {
          margin: 8px 12px;
        }
      `}</style>
    </>
  );
}
