import { useState } from "react";
import { Partition } from "../utils/domain/Partition";
import { PartitionConfig } from "../utils/domain/PartitionConfig";
import { SlackUser } from "../utils/slack/slack-user";
import { SendSlackMessage } from "./message/SendSlackMessage";
import { TemplateMessageEditor } from "./message/TemplateMessageEditor";
import { PartitionBuilder } from "./PartitionBuilder";
import { PartitionConfigBuilder } from "./PartitionConfigBuilder";
import { UsersFetcher } from "./UsersFetcher";
import { CollapseContainer } from "./util/CollapseContainer";

const DEFAULT_TEMPLATE_MESSAGE = `오늘의 :orange_heart:*두런두런치*:orange_heart: 조를 발표합니다!
> 가장 앞에 있는 분이 이 채널에 조원들을 소환해서 스레드로 함께 메뉴를 정해주세요 :simple_smile:
> 맛있게 먹고 사진 찍고 <#C01BUJFGM4G> 방에 공유하는 것 잊지 마세요 :camera_with_flash:
`;
export function MainComponent() {
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [partitionConfig, setPartitionConfig] = useState<PartitionConfig>({
    officeUsers: [],
    remoteUsers: [],
    excludedUsers: [],
    officeGroupCount: 0,
    remoteGroupCount: 0,
    tagToUserIdsMap: new Map(),
  });
  const [partition, setPartition] = useState<Partition>({ groups: [] });
  // tag name -> user ids map

  const [templateMessage, setTemplateMessage] = useState(
    DEFAULT_TEMPLATE_MESSAGE,
  );

  return (
    <div className="form-root">
      <CollapseContainer title="조 설정">
        <UsersFetcher setUsers={setUsers} />
        <PartitionConfigBuilder
          initialUsers={users}
          partitionConfig={partitionConfig}
          setPartitionConfig={setPartitionConfig}
        />
      </CollapseContainer>

      <CollapseContainer title="조 추첨 예시 결과">
        <PartitionBuilder
          partition={partition}
          partitionConfig={partitionConfig}
          setPartition={setPartition}
        />
      </CollapseContainer>
      <CollapseContainer title="슬랙 메세지 전송">
        <div>
          <TemplateMessageEditor
            templateMessage={templateMessage}
            setTemplateMessage={setTemplateMessage}
            setTemplateMessageToDefault={() =>
              setTemplateMessage(DEFAULT_TEMPLATE_MESSAGE)
            }
          />
          <SendSlackMessage
            templateMessage={templateMessage}
            partition={partition}
          />
        </div>
      </CollapseContainer>

      <style jsx>{`
        .form-root {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 10px;
          gap: 15px;
        }
      `}</style>
    </div>
  );
}
