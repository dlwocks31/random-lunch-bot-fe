import { useEffect, useState } from "react";
import { RemoteUserViewer } from "./group/RemoteUserViewer";
import { SendSlackMessage } from "./message/SendSlackMessage";
import { TagEditor } from "./tag/TagEditor";
import { UnselectedUserViewer } from "./group/UnselectedUserViewer";
import { UserGrouper } from "./group/UserGrouper";
import { SlackUser } from "../utils/slack/slack-user";
import { TemplateMessageEditor } from "./message/TemplateMessageEditor";
import { FlexUserFetcher } from "./fetch/FlexUserFetcher";
import { LunchUser } from "../utils/domain/LunchUser";
import { SlackServiceFactory } from "../utils/slack/SlackServiceFactory";
import { PartitionBuilder } from "./PartitionBuilder";
import { PartitionDisplayer } from "./PartitionDisplayer";

const DEFAULT_TEMPLATE_MESSAGE = `오늘의 :orange_heart:*두런두런치*:orange_heart: 조를 발표합니다!
> 가장 앞에 있는 분이 이 채널에 조원들을 소환해서 스레드로 함께 메뉴를 정해주세요 :simple_smile:
> 맛있게 먹고 사진 찍고 <#C01BUJFGM4G> 방에 공유하는 것 잊지 마세요 :camera_with_flash:
`;
export function MainComponent() {
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [partition, setPartition] = useState<SlackUser[][]>([]);
  // tag name -> user ids map

  const [templateMessage, setTemplateMessage] = useState(
    DEFAULT_TEMPLATE_MESSAGE,
  );
  useEffect(() => {
    getUsersFromSlack();
  }, []);

  async function getUsersFromSlack() {
    // TODO: API call로 대체
    const slackService = await SlackServiceFactory();
    slackService.findAllValidSlackUsers().then((users) => {
      setUsers(users);
    });
  }

  return (
    <div className="form-root">
      <PartitionBuilder initialUsers={users} setPartition={setPartition} />
      <PartitionDisplayer partition={partition} />
      <div>
        <TemplateMessageEditor
          templateMessage={templateMessage}
          setTemplateMessage={setTemplateMessage}
        />
        <SendSlackMessage
          templateMessage={templateMessage}
          partition={partition}
        />
      </div>
      <style jsx>{`
        .form-root {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 10px;
          gap: 15px;
        }
        .form-control {
          display: flex;
        }
        .datagrid-container {
          height: 500px;
          display: flex;
        }
      `}</style>
    </div>
  );
}
