import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  TextField,
} from "@mui/material";
import Select from "react-select";
import { useEffect, useState } from "react";
import { buildSlackMessage } from "../../utils/slack/BuildSlackMessage";
import { SlackServiceFactory } from "../../utils/slack/SlackServiceFactory";
import { Partition } from "../../utils/domain/Partition";
import { sortBy } from "lodash";

export function SendSlackMessage({
  templateMessage,
  partition,
}: {
  templateMessage: string;
  partition: Partition;
}) {
  const [channel, setChannel] = useState("");
  const [conversations, setConversations] = useState<
    { id: string; name: string; membersCount: number }[]
  >([]);
  const [isUserMentioned, setIsUserMentioned] = useState(true);
  const [isOnlyTemplate, setIsOnlyTemplate] = useState(false);
  const [isConfirmDialogOpened, setIsConfirmDialogOpened] = useState(false);
  const message = isOnlyTemplate
    ? templateMessage
    : buildSlackMessage(partition, templateMessage, isUserMentioned);
  const getConversations = async () => {
    const slackService = await SlackServiceFactory();
    const conversations = await slackService.listConversation();
    setConversations(
      sortBy(
        conversations.filter((c) => c.membersCount > 0),
        (c) => -c.membersCount,
        "name",
      ),
    );
  };
  const sendSlackMessage = async () => {
    const slackService = await SlackServiceFactory();
    const joinResult = await slackService.joinConversation(channel);
    console.log(JSON.stringify(joinResult));
    const result = await slackService.send(message, channel);
    console.log(JSON.stringify(result));
  };

  const channelDescription = () => {
    const conv = conversations.find((c) => c.id === channel);
    if (conv) {
      return `${conv.name} (멤버 ${conv.membersCount}명)`;
    }
    return "";
  };

  useEffect(() => {
    getConversations();
  }, []);

  return (
    <div className="root">
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
      <FormControlLabel
        control={
          <Checkbox
            checked={isUserMentioned}
            onChange={(e) => setIsUserMentioned(e.target.checked)}
          />
        }
        label="슬랙 메세지에서 조원을 멘션합니다."
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={isOnlyTemplate}
            onChange={(e) => setIsOnlyTemplate(e.target.checked)}
          />
        }
        label="템플릿 메세지만 전송합니다."
      />
      <div className="text-field-container">
        <TextField
          label="Message"
          disabled
          multiline
          fullWidth
          rows={20}
          value={message}
        />
      </div>

      <Button
        onClick={() => setIsConfirmDialogOpened(true)}
        variant="contained"
        disabled={!channel}
      >
        {channel ? "메세지 전송하기" : "채널을 선택해 주세요."}
      </Button>
      <Dialog
        open={isConfirmDialogOpened}
        onClose={() => setIsConfirmDialogOpened(false)}
      >
        <DialogTitle>정말로 메세지를 전송하시겠습니까?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            슬랙 채널{" "}
            <span style={{ fontWeight: "bold" }}> {channelDescription()}</span>{" "}
            에 메세지를 전송합니다.
          </DialogContentText>

          <DialogActions>
            <Button
              onClick={() => setIsConfirmDialogOpened(false)}
              variant="outlined"
            >
              취소
            </Button>
            <Button
              onClick={() => {
                setIsConfirmDialogOpened(false);
                sendSlackMessage();
              }}
              variant="contained"
            >
              메세지 전송
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <style jsx>
        {`
          .some-container {
            display: flex;
          }
          .send-container {
            display: flex;
            flex-direction: column;
          }
          .text-field-container {
            flex-grow: 2;
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
