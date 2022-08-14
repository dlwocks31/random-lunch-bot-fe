import { Button } from "@mui/material";
import { MemberPartition } from "../../utils/domain/MemberPartition";
import { SlackUser } from "../../utils/slack/slack-user";

export const MainMessageComponent = ({
  onStepDecrement,
  members,
}: {
  onStepDecrement: () => void;
  members: {
    office: MemberPartition;
    remote: MemberPartition;
    excluded: SlackUser[];
  };
}) => {
  return (
    <div>
      <Button variant="contained" onClick={onStepDecrement}>
        이전 단계로..
      </Button>
      <div>
        (드롭다운) 채널로 전송할 메세지:
        <div>모시기.. 1조: ..</div>
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
