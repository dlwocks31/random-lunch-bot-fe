import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import Select from "react-select";
import { useEffect, useState } from "react";
import { SlackUser } from "../../utils/slack/slack-user";
import { buildSlackMessage } from "../../utils/slack/BuildSlackMessage";
import { SlackServiceFactory } from "../../utils/slack/SlackServiceFactory";
import { Partition } from "../../utils/domain/Partition";

export function SendSlackMessage({
  templateMessage,
  partition,
}: {
  templateMessage: string;
  partition: Partition;
}) {
  const [channel, setChannel] = useState("");
  const [conversations, setConversations] = useState<
    { id: string; name: string }[]
  >([]);
  const [isUserMentioned, setIsUserMentioned] = useState(true);
  const message = buildSlackMessage(
    partition,
    templateMessage,
    isUserMentioned,
  );
  const getConversations = async () => {
    const slackService = await SlackServiceFactory();
    const conversations = await slackService.listConversation();
    setConversations(conversations);
  };
  const sendSlackMessage = async () => {
    const slackService = await SlackServiceFactory();
    const joinResult = await slackService.joinConversation(channel);
    console.log(JSON.stringify(joinResult));
    const result = await slackService.send(message, channel);
    console.log(JSON.stringify(result));
  };

  useEffect(() => {
    getConversations();
  }, []);

  return (
    <div className="root">
      <FormControlLabel
        control={
          <Checkbox
            checked={isUserMentioned}
            onChange={(e) => setIsUserMentioned(e.target.checked)}
          />
        }
        label="사용자 이름을 슬랙 멘션으로 전송합니다."
      />

      <TextField
        label="Message"
        disabled
        fullWidth
        multiline
        rows={20}
        value={message}
      />

      <div className="send-container">
        <div className="select-container">
          <Select
            placeholder={`메세지를 전송할 채널을 선택해 주세요 (총 ${conversations.length}개)`}
            options={conversations.map(({ id, name }) => ({
              value: id,
              label: name,
            }))}
            onChange={(e) => setChannel(e?.value || "")}
          />
        </div>
        <Button
          onClick={sendSlackMessage}
          variant="contained"
          sx={{ flexGrow: 1 }}
        >
          메세지 전송하기
        </Button>
      </div>

      <style jsx>
        {`
          .send-container {
            display: flex;
            justify-content: space-around;
            gap: 10px;
          }
          .select-container {
            flex-grow: 1;
          }
          .root {
            padding: 10px 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
        `}
      </style>
    </div>
  );
}
