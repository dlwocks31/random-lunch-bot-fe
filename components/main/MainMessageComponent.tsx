import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import Select from "react-select";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { SlackConversation } from "../../utils/domain/SlackConversation";
import { NormalUser } from "../../utils/slack/NormalUser";
import { SlackServiceFactory } from "../../utils/slack/SlackServiceFactory";

const DEFAULT_TEMPLATE_MESSAGE = `오늘의 :orange_heart:*두런두런치*:orange_heart: 조를 발표합니다!
> 가장 앞에 있는 분이 이 채널에 조원들을 소환해서 스레드로 함께 메뉴를 정해주세요 :simple_smile:
> 맛있게 먹고 사진 찍고 <#C01BUJFGM4G> 방에 공유하는 것 잊지 마세요 :camera_with_flash:
`;

export const MainMessageComponent = ({
  members,
  slackConfig: { slackInstalled, slackConversations },
}: {
  members: MemberConfig;
  slackConfig: {
    slackInstalled: boolean;
    slackConversations: SlackConversation[];
  };
}) => {
  const [prefixMessage, setPrefixMessage] = useState<string>(
    DEFAULT_TEMPLATE_MESSAGE,
  );
  const [shouldDisableMention, setShouldDisableMention] = useState<boolean>(
    !slackInstalled,
  );

  const membersSlackMessage = customBuildSlackMessage(
    members,
    shouldDisableMention,
  );
  const message = [prefixMessage, membersSlackMessage].join("\n");

  useEffect(() => {
    if (slackInstalled) {
      setShouldDisableMention(false);
    }
  }, [slackInstalled]);

  return (
    <Box display="flex" gap={1}>
      <Box flexGrow={2} flexBasis={0}>
        <MessageDisplayer
          slackInstalled={slackInstalled}
          prefixMessage={prefixMessage}
          setPrefixMessage={setPrefixMessage}
          mainMessage={membersSlackMessage}
        />
      </Box>

      {slackInstalled && (
        <Box
          flexGrow={1}
          flexBasis={0}
          display="flex"
          flexDirection="column"
          justifyContent="end"
        >
          <div>
            <MessageSender
              message={message}
              slackConversations={slackConversations}
            />
          </div>
        </Box>
      )}
    </Box>
  );
};

const MessageDisplayer = ({
  slackInstalled,
  prefixMessage,
  setPrefixMessage,
  mainMessage,
}: {
  slackInstalled: boolean;
  prefixMessage: string;
  setPrefixMessage: (prefixMessage: string) => void;
  mainMessage: string;
}) => {
  return (
    <div>
      {slackInstalled && (
        <TextField
          label="메세지 템플릿"
          multiline
          fullWidth
          value={prefixMessage}
          onChange={(e) => setPrefixMessage(e.target.value)}
        />
      )}
      <TextField
        focused={false}
        disabled
        multiline
        fullWidth
        value={mainMessage ? mainMessage : "조원을 추가해 보세요."}
        InputProps={{
          endAdornment: (
            <Button
              disabled={!mainMessage}
              onClick={() => {
                navigator.clipboard.writeText(mainMessage);
              }}
            >
              Copy
            </Button>
          ),
        }}
      />
    </div>
  );
};
const MessageSender = ({
  message,
  slackConversations,
}: {
  message: string;
  slackConversations: SlackConversation[];
}) => {
  const [isConfirmDialogOpened, setIsConfirmDialogOpened] = useState(false);
  const [channel, setChannel] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const sendSlackMessage = async () => {
    setIsSending(true);
    const slackService = await SlackServiceFactory();
    const joinResult = await slackService.joinConversation(channel);
    console.log(JSON.stringify(joinResult));
    const result = await slackService.send(message, channel);
    console.log(JSON.stringify(result));
    setIsSending(false);
  };
  const channelDescription = () => {
    const conv = slackConversations.find((c) => c.id === channel);
    if (conv) {
      return `${conv.name} (멤버 ${conv.membersCount}명)`;
    }
    return "";
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
          <div style={{ flex: "1 0 0" }}>
            <Select
              placeholder={`메세지를 전송할 채널을 선택하세요 (총 ${slackConversations.length}개)`}
              options={slackConversations.map(({ id, name }) => ({
                value: id,
                label: name,
              }))}
              onChange={(e) => setChannel(e?.value || "")}
              menuPlacement="auto"
            />{" "}
          </div>

          <div style={{ flex: "1 0 0" }}>
            <Button
              onClick={() => setIsConfirmDialogOpened(true)}
              variant="contained"
              fullWidth
              disabled={isSending || channel === ""}
            >
              위 채널로 메세지 전송
            </Button>
          </div>
        </div>
      </div>

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
                sendSlackMessage().then(() => setIsConfirmDialogOpened(false));
              }}
              variant="contained"
              disabled={isSending}
            >
              메세지 전송
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

const customBuildSlackMessage = (
  members: MemberConfig,
  shouldDisableMention: boolean,
) => {
  const userToStr = (u: NormalUser) =>
    shouldDisableMention ? u.name : `<@${u.id}>`;
  const messageList = [];
  let groupNum = 1;
  for (const users of members.office.groups) {
    const names = users.map(userToStr).join(" ");
    messageList.push(`${groupNum}조: ${names}`);
    groupNum++;
  }
  for (const users of members.remote.groups) {
    const names = users.map(userToStr).join(" ");
    messageList.push(`${groupNum}조: ${names}`);
    groupNum++;
  }
  return messageList.join("\n");
};
