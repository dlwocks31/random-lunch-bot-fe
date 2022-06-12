import { Button, TextField } from "@mui/material";
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
  const message = buildSlackMessage(partition, templateMessage);
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
      <div className="select-container">
        <Select
          placeholder={`Select a conversation: ${conversations.length} conversations found`}
          options={conversations.map(({ id, name }) => ({
            value: id,
            label: name,
          }))}
          onChange={(e) => setChannel(e?.value || "")}
        />
      </div>
      <TextField
        label="Message"
        disabled
        fullWidth
        multiline
        rows={20}
        value={message}
      />

      <Button onClick={sendSlackMessage}>Send</Button>
      <style jsx>
        {`
          .select-container {
            display: flex;
            width: 500px;
          }
          .root {
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
        `}
      </style>
    </div>
  );
}
