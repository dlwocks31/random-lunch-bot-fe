import { useEffect, useState } from "react";
import { SupabaseSlackAuthBar } from "../components/auth/SupabaseSlackAuthBar";
import { MainGroupComopnent } from "../components/main/MainGroupComponent";
import { MainMessageComponent } from "../components/main/MainMessageComponent";
import { MemberConfig } from "../utils/domain/MemberConfig";
import { MemberPartition } from "../utils/domain/MemberPartition";
import { SlackServiceFactory } from "../utils/slack/SlackServiceFactory";

export default () => {
  const [slackInstalled, setSlackInstalled] = useState(false);
  const [step, setStep] = useState(0);
  const [members, setMembers] = useState<MemberConfig>({
    office: new MemberPartition([]),
    remote: new MemberPartition([]),
    excluded: [],
  });
  useEffect(() => {
    if (slackInstalled) {
      (async () => {
        const slackService = await SlackServiceFactory();
        const users = await slackService.findAllValidSlackUsers();
        console.log(users);
      })();
    }
  }, [slackInstalled]);
  return (
    <>
      <SupabaseSlackAuthBar setSlackInstalled={setSlackInstalled} />
      {slackInstalled ? (
        step === 0 ? (
          <MainGroupComopnent
            onStepIncrement={() => setStep(1)}
            members={members}
            setMembers={setMembers}
          />
        ) : (
          <MainMessageComponent
            onStepDecrement={() => setStep(0)}
            members={members}
          />
        )
      ) : (
        <div>슬랙 설치가 필요합니다.</div>
      )}
    </>
  );
};
