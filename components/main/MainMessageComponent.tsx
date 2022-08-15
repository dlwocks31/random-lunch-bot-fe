import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import Select from "react-select";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { SlackConversation } from "../../utils/domain/SlackConversation";
import { SlackServiceFactory } from "../../utils/slack/SlackServiceFactory";

const DEFAULT_TEMPLATE_MESSAGE = `오늘의 :orange_heart:*두런두런치*:orange_heart: 조를 발표합니다!
> 가장 앞에 있는 분이 이 채널에 조원들을 소환해서 스레드로 함께 메뉴를 정해주세요 :simple_smile:
> 맛있게 먹고 사진 찍고 <#C01BUJFGM4G> 방에 공유하는 것 잊지 마세요 :camera_with_flash:
`;

export const MainMessageComponent = ({
  onStepDecrement,
  members,
  slackConversations,
}: {
  onStepDecrement: () => void;
  members: MemberConfig;
  slackConversations: SlackConversation[];
}) => {
  const [channel, setChannel] = useState<string>("");
  const [isConfirmDialogOpened, setIsConfirmDialogOpened] = useState(false);
  const message =
    DEFAULT_TEMPLATE_MESSAGE + "\n" + customBuildSlackMessage(members);
  const sendSlackMessage = async () => {
    const slackService = await SlackServiceFactory();
    const joinResult = await slackService.joinConversation(channel);
    console.log(JSON.stringify(joinResult));
    const result = await slackService.send(message, channel);
    console.log(JSON.stringify(result));
  };
  const channelDescription = () => {
    const conv = slackConversations.find((c) => c.id === channel);
    if (conv) {
      return `${conv.name} (멤버 ${conv.membersCount}명)`;
    }
    return "";
  };
  return (
    <div>
      <Button variant="contained" onClick={onStepDecrement}>
        {"<"} 이전 단계로
      </Button>
      <div>
        메세지:
        <div>
          <TextField
            label="전송할 메세지"
            disabled
            multiline
            fullWidth
            rows={20}
            value={message}
          />
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
      </div>
      <div>추가 설정:</div>
      <Button
        onClick={() => setIsConfirmDialogOpened(true)}
        variant="contained"
        fullWidth
        disabled={!channel}
      >
        {channel ? "메세지 전송하기" : "메세지를 전송할 채널을 선택해 주세요."}
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
    </div>
  );
};

const customBuildSlackMessage = (members: MemberConfig) => {
  const messageList = [];
  let groupNum = 1;
  for (const users of members.office.groups) {
    const names = users.map((u) => `<@${u.id}>`).join(" ");
    messageList.push(`${groupNum}조: ${names}`);
    groupNum++;
  }
  for (const users of members.remote.groups) {
    const names = users.map((u) => `<@${u.id}>`).join(" ");
    messageList.push(`${groupNum}조: ${names}`);
    groupNum++;
  }
  return messageList.join("\n");
};
