import { Button, Chip } from "@mui/material";
import Select from "react-select";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { MemberPartition } from "../../utils/domain/MemberPartition";
import { SlackUser } from "../../utils/slack/slack-user";
import { EachGroupSizeEditor } from "../group/EachGroupSizeEditor";
import { CollapseContainer } from "../util/CollapseContainer";

const CustomUserGroupTypeSelector = ({
  allUsers,
  includedUsers,
  addGroupUser,
}: {
  allUsers: SlackUser[];
  includedUsers: SlackUser[];
  addGroupUser: (user: SlackUser) => void;
}) => {
  const unselectedUsers = allUsers.filter(
    (u) => !includedUsers.some((su) => su.id === u.id),
  );
  return (
    <div>
      <Select
        placeholder="유저 이름을 검색하세요"
        options={unselectedUsers.map(({ id, displayName }) => ({
          value: id,
          label: displayName,
        }))}
        value={null}
        onChange={(e) => {
          if (e) {
            const user = allUsers.find((u) => u.id === e.value);
            if (user) {
              addGroupUser(user);
            }
          }
        }}
      />
    </div>
  );
};

const MemberPartitionComponent = ({
  partition,
  allUsers,
  groupTypeName,
  onAddGroupUser,
  setPartition,
}: {
  partition: MemberPartition;
  allUsers: SlackUser[];
  groupTypeName: string;
  onAddGroupUser: (user: SlackUser) => void;
  setPartition: (partition: MemberPartition) => void;
}) => (
  <CollapseContainer
    title={`${groupTypeName} - 총 ${partition.userCount()}명 / ${partition.groupCount()}조`}
  >
    <div>
      <div>
        조별 인원 수:{" "}
        <EachGroupSizeEditor
          eachGroupSize={partition.defaultGroupSize}
          setEachGroupSize={(eachGroupSize) => {
            console.log("eachGroupSize is ", eachGroupSize);
            setPartition(partition.changeDefaultGroupSize(eachGroupSize));
          }}
        />
      </div>
      <div>조 개수: (-) {partition.groupCount()}개 (+)</div>
      <div>
        {groupTypeName} 인원 추가:
        <CustomUserGroupTypeSelector
          allUsers={allUsers}
          includedUsers={partition.users()}
          addGroupUser={onAddGroupUser}
        />
      </div>
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
  allUsers,
  groupTypeName,
  onAddGroupUser,
}: {
  users: SlackUser[];
  allUsers: SlackUser[];
  groupTypeName: string;
  onAddGroupUser: (user: SlackUser) => void;
}) => (
  <CollapseContainer title={`${groupTypeName} - 총 ${users.length}명`}>
    <div>
      <div>
        {groupTypeName} 인원 추가:{" "}
        <CustomUserGroupTypeSelector
          allUsers={allUsers}
          includedUsers={users}
          addGroupUser={onAddGroupUser}
        />
      </div>
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
  members: MemberConfig;
  setMembers: (members: MemberConfig) => void;
}) => {
  const allUsers = members.allUsers();
  console.log("XXX remoteUser:");
  console.log(members.remote);
  return (
    <div>
      <div>먼저, 슬랙에서 가져온 조원을 설정해 주세요.</div>
      <div>
        <MemberPartitionComponent
          allUsers={allUsers}
          partition={members.office}
          groupTypeName="사무실"
          onAddGroupUser={(user) =>
            setMembers(members.moveMemberToOffice(user))
          }
          setPartition={(partition) =>
            setMembers(members.setOfficePartition(partition))
          }
        />
        <MemberPartitionComponent
          allUsers={allUsers}
          partition={members.remote}
          groupTypeName="재택"
          onAddGroupUser={(user) =>
            setMembers(members.moveMemberToRemote(user))
          }
          setPartition={(partition) =>
            setMembers(members.setRemotePartition(partition))
          }
        />
        <UsersListComponent
          users={members.excluded}
          groupTypeName="제외"
          allUsers={allUsers}
          onAddGroupUser={(user) =>
            setMembers(members.moveMemberToExcluded(user))
          }
        />
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
