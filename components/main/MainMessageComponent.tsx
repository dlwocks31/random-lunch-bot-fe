import { Button, TextField } from "@mui/material";
import { MemberConfig } from "../../utils/domain/MemberConfig";

const DEFAULT_TEMPLATE_MESSAGE = `오늘의 :orange_heart:*두런두런치*:orange_heart: 조를 발표합니다!
> 가장 앞에 있는 분이 이 채널에 조원들을 소환해서 스레드로 함께 메뉴를 정해주세요 :simple_smile:
> 맛있게 먹고 사진 찍고 <#C01BUJFGM4G> 방에 공유하는 것 잊지 마세요 :camera_with_flash:
`;

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

export const MainMessageComponent = ({
  onStepDecrement,
  members,
}: {
  onStepDecrement: () => void;
  members: MemberConfig;
}) => {
  const message =
    DEFAULT_TEMPLATE_MESSAGE + "\n" + customBuildSlackMessage(members);
  return (
    <div>
      <Button variant="contained" onClick={onStepDecrement}>
        이전 단계로..
      </Button>
      <div>
        (드롭다운) 채널로 전송할 메세지:
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
      </div>
      <div>
        고급 설정:
        <div>이거 하기 체크박스</div>
        <div>저거 하기 체크박스</div>
      </div>
      <Button variant="contained">전송하기</Button>
    </div>
  );
};
