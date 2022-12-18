import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@mui/material";
import { useState } from "react";
import Select from "react-select";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { SlackConversation } from "../../utils/domain/SlackConversation";
import { NormalUser } from "../../utils/slack/NormalUser";
import { SlackServiceFactory } from "../../utils/slack/SlackServiceFactory";
import { ExtraSettingViewer } from "../util/ExtraSettingViewer";

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
  const [shouldIgnoreMember, setShouldIgnoreMember] = useState<boolean>(false);
  const [shouldDisableMention, setShouldDisableMention] = useState<boolean>(
    !slackInstalled,
  );
  const message = shouldIgnoreMember
    ? prefixMessage
    : [
        prefixMessage,
        customBuildSlackMessage(members, shouldDisableMention),
      ].join("\n");

  return (
    <div>
      <div>
        <TextField
          label="전송할 메세지"
          disabled
          multiline
          fullWidth
          rows={20}
          value={message}
        />
      </div>

      <ExtraSettingViewer settingName="기타 설정">
        <TextField
          label="메세지 템플릿"
          multiline
          fullWidth
          value={prefixMessage}
          onChange={(e) => setPrefixMessage(e.target.value)}
        />
        <FormGroup>
          {slackInstalled && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldIgnoreMember}
                  onChange={(e) => setShouldIgnoreMember(e.target.checked)}
                />
              }
              label="조원을 생략하고 메세지를 전송합니다."
            />
          )}
          {slackInstalled && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldDisableMention}
                  onChange={(e) => setShouldDisableMention(e.target.checked)}
                />
              }
              label="조원을 멘션하지 않습니다."
            />
          )}
        </FormGroup>
      </ExtraSettingViewer>
      {slackInstalled && (
        <MessageSender
          message={message}
          slackConversations={slackConversations}
        />
      )}
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
        <div>
          <div>전송할 채널:</div>
          <Select
            placeholder={`메세지를 전송할 채널을 선택해 주세요 (총 ${slackConversations.length}개)`}
            options={slackConversations.map(({ id, name }) => ({
              value: id,
              label: name,
            }))}
            onChange={(e) => setChannel(e?.value || "")}
          />{" "}
        </div>
        <Button
          onClick={() => setIsConfirmDialogOpened(true)}
          variant="contained"
          fullWidth
          disabled={!channel}
        >
          {channel
            ? "메세지 전송하기"
            : "메세지를 전송할 채널을 선택해 주세요."}
        </Button>
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
