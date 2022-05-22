import { Button, FormControl, TextField } from "@mui/material";
import type { NextPage } from "next";
import { useState } from "react";
import { RemoteUserViewer } from "../components/group/RemoteUserViewer";
import { SendSlackMessage } from "../components/message/SendSlackMessage";
import { TagEditor } from "../components/tag/TagEditor";
import { UnselectedUserViewer } from "../components/group/UnselectedUserViewer";
import { UserGrouper } from "../components/group/UserGrouper";
import { SlackUser } from "../utils/slack/slack-user";
import { SlackService } from "../utils/slack/slack.service";
import { TemplateMessageEditor } from "../components/message/TemplateMessageEditor";

const DEFAULT_TEMPLATE_MESSAGE = `오늘의 :orange_heart:*두런두런치*:orange_heart: 조를 발표합니다!
> 가장 앞에 있는 분이 이 채널에 조원들을 소환해서 스레드로 함께 메뉴를 정해주세요 :simple_smile:
> 맛있게 먹고 사진 찍고 <#C01BUJFGM4G> 방에 공유하는 것 잊지 마세요 :camera_with_flash:`;
const Home: NextPage = () => {
  const [oauthToken, setOauthToken] = useState("");
  const [users, setUsers] = useState<
    { user: SlackUser; selected: boolean; isRemote: boolean }[]
  >([]);
  const [partition, setPartition] = useState<SlackUser[][]>([]);
  // tag name -> user ids map
  const [tagMap, setTagMap] = useState<Map<string, string[]>>(new Map());
  const [templateMessage, setTemplateMessage] = useState(
    DEFAULT_TEMPLATE_MESSAGE,
  );

  function getUsersFromSlack() {
    const slackService = new SlackService(oauthToken);
    slackService.findAllValidSlackUsers().then((users) => {
      setUsers(
        users.map((u) => ({ user: u, selected: true, isRemote: false })),
      );
    });
  }

  function onRemoteUserChange(userIds: string[]) {
    setUsers((users) =>
      users.map((u) => {
        const isRemote = userIds.includes(u.user.id);
        return {
          ...u,
          selected: isRemote ? true : u.selected,
          isRemote,
        };
      }),
    );
  }

  function onUnselectUserChange(unselectedUserIds: string[]) {
    setUsers((users) =>
      users.map((u) => {
        const selected = !unselectedUserIds.includes(u.user.id);
        return {
          ...u,
          isRemote: selected ? u.isRemote : false,
          selected,
        };
      }),
    );
  }

  return (
    <div className="form-root">
      <FormControl className="form-control">
        <TextField
          className="text-field"
          id="bot-oauth-token"
          label="Bot OAuth Token"
          value={oauthToken}
          onChange={(e) => setOauthToken(e.target.value)}
        />
        <Button onClick={getUsersFromSlack}>Submit</Button>
      </FormControl>
      <div>
        <UserGrouper
          officeUsers={users
            .filter((u) => u.selected && !u.isRemote)
            .map((u) => u.user)}
          remoteUsers={users
            .filter((u) => u.selected && u.isRemote)
            .map((u) => u.user)}
          tagMap={tagMap}
          partition={partition}
          setPartition={setPartition}
        />
        <UnselectedUserViewer
          allUsers={users.map((u) => u.user)}
          unselectedUsers={users.filter((u) => !u.selected).map((u) => u.user)}
          onChange={onUnselectUserChange}
        />
        <RemoteUserViewer
          allUsers={users.map((u) => u.user)}
          remoteUsers={users.filter((u) => u.isRemote).map((u) => u.user)}
          onChange={onRemoteUserChange}
        />
      </div>
      <div>
        <TagEditor
          users={users.map((u) => u.user)}
          tagMap={tagMap}
          onTagMapChange={setTagMap}
        />
      </div>
      <div>
        <TemplateMessageEditor
          templateMessage={templateMessage}
          setTemplateMessage={setTemplateMessage}
        />
        <SendSlackMessage
          oauthToken={oauthToken}
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
};

export default Home;
