import { Button, Chip } from "@mui/material";
import { MemberPartition } from "../../utils/domain/MemberPartition";
import { SlackUser } from "../../utils/slack/slack-user";

export const MainGroupComopnent = ({
  onStepIncrement,
  members,
  setMembers,
}: {
  onStepIncrement: () => void;
  members: {
    office: MemberPartition;
    remote: MemberPartition;
    excluded: SlackUser[];
  };
  setMembers: (members: {
    office: MemberPartition;
    remote: MemberPartition;
    excluded: SlackUser[];
  }) => void;
}) => {
  return (
    <div>
      <div>먼저, 슬랙에서 가져온 조원을 설정해 주세요.</div>
      <div>
        <div>
          사무실 - 총 {members.office.userCount()}명 /{" "}
          {members.office.groupCount()}개 조
        </div>
        <div>
          <div>조별 인원 수: 3명 / 4명 / 5명 / 6명</div>
          <div>조 개수: (-) 15개 (+)</div>
          <div>사무실 인원 추가: 드롭다운</div>
          <div>
            {members.office.groups.map((group, i) => (
              <div key={i} className="group-container">
                <div>{i + 1}조:</div>
                {group.map((user) => (
                  <Chip label={user.displayName} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div>
          재택 - 총 {members.remote.userCount()}명 /{" "}
          {members.remote.groupCount()}개 조
        </div>
        <div>
          <div>조별 인원 수: 3명 / 4명 / 5명 / 6명</div>
          <div>조 개수: (-) 15개 (+)</div>
          <div>재택 인원 추가: 드롭다운</div>
          <div>1조: {JSON.stringify(members.remote.groups)}</div>
        </div>
      </div>
      <div>
        <div>불참 - 총 3명</div>
        <div>불참 인원: {JSON.stringify(members.excluded)}</div>
      </div>
      <div>
        <div>부가 설정</div>
        <div>
          <div>유저 가져오는 채널:</div>
          <div>전체에서 가져오기</div>
        </div>
        <div>
          <div>flex 연동</div>
          <div>계정: ...</div>
        </div>
        <div>
          <div>같은 조 피하기 설정</div>
          <div>더 자세히 설정:</div>
        </div>
      </div>
      <Button variant="contained" onClick={onStepIncrement}>
        다음 단계로
      </Button>
      <style jsx>{`
        .group-container {
          display: flex;
          gap: 3px;
          align-items: center;
          padding: 2px 0;
        }
      `}</style>
    </div>
  );
};
