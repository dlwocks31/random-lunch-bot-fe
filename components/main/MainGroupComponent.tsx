import { Button, Chip } from "@mui/material";
import { MemberPartition } from "../../utils/domain/MemberPartition";
import { SlackUser } from "../../utils/slack/slack-user";
import { CollapseContainer } from "../util/CollapseContainer";

const MemberPartitionComponent = ({
  partition,
  groupTypeName,
}: {
  partition: MemberPartition;
  groupTypeName: string;
}) => (
  <CollapseContainer
    title={`${groupTypeName} - 총 ${partition.userCount()}명 / ${partition.groupCount()}조`}
  >
    <div>
      <div>조별 인원 수: 3명 / 4명 / 5명 / 6명</div>
      <div>조 개수: (-) {partition.groupCount()}개 (+)</div>
      <div>{groupTypeName} 인원 추가: 드롭다운</div>
      <div>
        {partition.groups.map((group, i) => (
          <div key={i} className="group-container">
            <div>{i + 1}조:</div>
            {group.map((user) => (
              <Chip key={user.id} label={user.displayName} />
            ))}
          </div>
        ))}
      </div>
      <style jsx>{`
        .group-container {
          display: flex;
          gap: 3px;
          align-items: center;
          padding: 2px 0;
        }
      `}</style>
    </div>
  </CollapseContainer>
);

const UsersListComponent = ({
  users,
  groupTypeName,
}: {
  users: SlackUser[];
  groupTypeName: string;
}) => (
  <CollapseContainer title={`${groupTypeName} - 총 ${users.length}명`}>
    <div>
      <div>{groupTypeName} 인원 추가: 드롭다운</div>
      <div>
        {users.map((user) => (
          <Chip key={user.id} label={user.displayName} />
        ))}
      </div>
    </div>
  </CollapseContainer>
);

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
        <MemberPartitionComponent
          partition={members.office}
          groupTypeName="사무실"
        />
        <MemberPartitionComponent
          partition={members.remote}
          groupTypeName="재택"
        />
        <UsersListComponent users={members.excluded} groupTypeName="제외" />
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
    </div>
  );
};
