import { sortBy } from "lodash";
import { useEffect, useState } from "react";
import { SupabaseSlackAuthBar } from "../components/auth/SupabaseSlackAuthBar";
import { MainGroupComopnent } from "../components/main/MainGroupComponent";
import { MainMessageComponent } from "../components/main/MainMessageComponent";
import { MemberConfig } from "../utils/domain/MemberConfig";
import { MemberPartition } from "../utils/domain/MemberPartition";
import { SlackConversation } from "../utils/domain/SlackConversation";
import { SlackServiceFactory } from "../utils/slack/SlackServiceFactory";
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
  const initializeFromSlack = async () => {
    const slackService = await SlackServiceFactory();
    const conversations = await slackService.listConversation();
    const users = await slackService.findAllValidSlackUsers();
    setConversations(
      sortBy(
        conversations.filter((c) => c.membersCount > 0),
        (c) => -c.membersCount,
        "name",
      ),
    );
    setMembers(MemberConfig.initializeFromUsers(users));
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
        {slackInstalled ? (
          step === 0 ? (
            <MainGroupComopnent
              onStepIncrement={() => setStep(1)}
              members={members}
              setMembers={setMembers}
              conversations={conversations}
            />
          ) : (
            <MainMessageComponent
              onStepDecrement={() => setStep(0)}
              slackConversations={conversations}
              members={members}
            />
          )
        ) : (
          <div>슬랙 설치가 필요합니다.</div>
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
