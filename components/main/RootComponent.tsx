import {
  Alert,
  Button,
  Chip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import CreatableSelect from "react-select/creatable";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { MemberPartition } from "../../utils/domain/MemberPartition";
import { TagMap } from "../../utils/domain/TagMap";
import { NormalUser } from "../../utils/slack/NormalUser";
import { BorderedBox } from "../util/BorderedBox";
import { StepInput } from "../util/StepInput";

type PartitionType = "office" | "remote" | "excluded";
export const RootComponent = ({
  members,
  setMembers,
  tagMap,
}: {
  members: MemberConfig;
  setMembers: (members: MemberConfig) => void;
  tagMap: TagMap;
}) => {
  const [currentPartitionLabel, setCurrentPartitionLabel] =
    useState<PartitionType>("office");
  const currentVisibleUsers =
    currentPartitionLabel === "office"
      ? members.office.users()
      : currentPartitionLabel === "remote"
      ? members.remote.users()
      : members.excluded;
  const allUsers = members.allUsers();

  const onShuffle = () => {
    setMembers(members.shuffleByTagMap(tagMap));
  };

  const isMobile = useMediaQuery("(max-width: 600px)");

  const currentDisplayComponent =
    currentPartitionLabel === "office" ? (
      <DisplayMemberPartitionComponent
        memberPartition={members.office}
        setGroupCount={(count) =>
          setMembers(members.setOfficeGroupCount(count))
        }
        onShuffle={onShuffle}
        indexOffset={1}
        isMobile={isMobile}
      />
    ) : currentPartitionLabel === "remote" ? (
      <DisplayMemberPartitionComponent
        memberPartition={members.remote}
        setGroupCount={(count) =>
          setMembers(members.setRemoteGroupCount(count))
        }
        onShuffle={onShuffle}
        indexOffset={members.office.groupCount() + 1}
        isMobile={isMobile}
      />
    ) : (
      <DisplayExcludedComponent users={members.excluded} />
    );

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "1rem",
          maxWidth: "1200px",
        }}
      >
        <ToggleButtonGroup
          color="primary"
          value={currentPartitionLabel}
          exclusive
          onChange={(event, newPartition: PartitionType) => {
            setCurrentPartitionLabel(newPartition);
          }}
          size="small"
          sx={{ display: "flex", flex: "3 0 0" }}
        >
          <ToggleButton
            value="office"
            sx={{ flex: "1 0 0", wordBreak: "keep-all" }}
          >
            사무실 - {members.office.userCount()}명/
            {members.office.groupCount()}조
          </ToggleButton>
          <ToggleButton
            value="remote"
            sx={{ flex: "1 0 0", wordBreak: "keep-all" }}
          >
            재택 - {members.remote.userCount()}명/
            {members.remote.groupCount()}조
          </ToggleButton>
          <ToggleButton
            value="excluded"
            sx={{ flex: "1 0 0", wordBreak: "keep-all" }}
          >
            제외 - {members.excluded.length}명
          </ToggleButton>
        </ToggleButtonGroup>

        <Box flex="2 0 0" display="flex" alignItems="center" gap={1}>
          <Box>그룹에 추가:</Box>
          <CreatableSelect
            placeholder="유저 이름을 검색하거나 추가하세요"
            options={allUsers
              .filter((u) => !currentVisibleUsers.includes(u))
              .map(({ id, name }) => ({
                value: id,
                label: name,
              }))}
            value={null}
            onChange={(selectedOption) => {
              const selectedUser = allUsers.find(
                (u) => u.id === selectedOption?.value,
              );
              if (selectedUser === undefined) return;
              if (currentPartitionLabel === "office") {
                setMembers(members.moveMemberToOffice(selectedUser));
              } else if (currentPartitionLabel === "remote") {
                setMembers(members.moveMemberToRemote(selectedUser));
              } else {
                setMembers(members.moveMemberToExcluded(selectedUser));
              }
            }}
            onCreateOption={(name: string) => {
              const newUser = new NormalUser(name);
              if (currentPartitionLabel === "office") {
                setMembers(members.addOfficeUser(newUser));
              } else if (currentPartitionLabel === "remote") {
                setMembers(members.addRemoteUser(newUser));
              } else {
                setMembers(members.addExcludedUser(newUser));
              }
            }}
          />
        </Box>
      </div>
      <BorderedBox>{currentDisplayComponent}</BorderedBox>
    </>
  );
};

const DisplayMemberPartitionComponent = ({
  memberPartition,
  setGroupCount,
  onShuffle,
  indexOffset,
  isMobile,
}: {
  memberPartition: MemberPartition;
  setGroupCount: (count: number) => void;
  onShuffle: () => void;
  indexOffset: number;
  isMobile: boolean;
}) => {
  if (memberPartition.userCount() === 0) {
    return <div>유저가 없습니다.</div>;
  }
  const groupSizeStat = memberPartition.groupSizeStat();
  const groupSizeStatLabel = groupSizeStat
    .map((stat) => `${stat.size}인조 ${stat.numberOfGroups}개`)
    .join(" / ");

  return (
    <Box
      sx={{
        display: "flex",
        gap: "10px",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "2px",
          flexDirection: "column",
          overflowX: "auto",
        }}
      >
        {memberPartition.groups.map((users, index) => (
          <SingleGroupComponent
            groupIndex={index + indexOffset}
            users={users}
            key={index}
          />
        ))}
      </Box>
      <Divider flexItem />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: isMobile ? "column" : "row",
          gap: "10px",
          justifyContent: "flex-start",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <div>총 조 개수:</div>
          <StepInput
            count={memberPartition.groupCount()}
            setCount={setGroupCount}
          />
          <div>개</div>
        </Box>
        <Box display="flex" gap={1}>
          <Alert severity="info">{groupSizeStatLabel}를 만듭니다.</Alert>
          <Button variant="outlined" onClick={onShuffle}>
            재추첨
          </Button>
        </Box>
      </div>
    </Box>
  );
};

const SingleGroupComponent = ({
  groupIndex,
  users,
}: {
  groupIndex: number;
  users: NormalUser[];
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      <div style={{ minWidth: "40px" }}>{groupIndex}조: </div>
      {users.map((user) => (
        <Chip
          style={{ maxWidth: "200px", flexGrow: 1 }}
          label={user.nameWithStatus}
          key={user.id}
        />
      ))}
    </div>
  );
};

const DisplayExcludedComponent = ({ users }: { users: NormalUser[] }) => {
  if (users.length === 0) return <div>제외된 유저가 없습니다.</div>;
  return (
    <Box>
      <div>제외된 유저:</div>
      <Box sx={{ display: "flex" }}>
        {users.map((user) => (
          <Chip label={user.nameWithStatus} key={user.id} />
        ))}
      </Box>
    </Box>
  );
};
