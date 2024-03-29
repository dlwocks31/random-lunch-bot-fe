import {
  Alert,
  Button,
  Chip,
  Divider,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from "@mui/material";
import { Box } from "@mui/system";
import { useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { MemberPartition } from "../../utils/domain/MemberPartition";
import { TagMap } from "../../utils/domain/TagMap";
import { useSlackOauthStatus } from "../../utils/hooks/UseSlackOauthStatus";
import { NormalUser } from "../../utils/slack/NormalUser";
import { AddToSlackButton } from "../auth/AddToSlackButton";
import { SocialLogin } from "../auth/SocialLogin";
import { BorderedBox } from "../util/BorderedBox";
import { StepInput } from "../util/StepInput";
import { UserSelector } from "../util/UserSelector";

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

  const { slackTeamName } = useSlackOauthStatus();

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
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        gap="10px"
        justifyContent="center"
        marginBottom="1rem"
        maxWidth="1200px"
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
          <Box flex="0 0 auto">그룹에 추가:</Box>
          <Box flex="1 0 auto">
            <UserSelector
              members={members}
              setMembers={setMembers}
              currentPartitionLabel={currentPartitionLabel}
              creatable={!slackTeamName}
            />
          </Box>
        </Box>
      </Box>
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
  const { slackTeamName, isLoading } = useSlackOauthStatus();
  const user = useUser();
  if (isLoading) {
    return (
      <Box textAlign="center">
        <div>슬랙 연동 정보를 불러오는 중입니다...</div>
        <LinearProgress sx={{ marginTop: 1 }} />
      </Box>
    );
  }
  if (memberPartition.userCount() === 0) {
    return slackTeamName ? (
      <Box textAlign="center">
        <div>슬랙 유저를 가져오는 중입니다..</div>
        <LinearProgress sx={{ marginTop: 1 }} />
      </Box>
    ) : (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        <div>조원이 없습니다.</div>
        <Box textAlign="center" sx={{ wordBreak: "keep-all" }}>
          조원을 이름으로 직접 추가하거나, {!user && "로그인 후"} 슬랙 앱을
          워크스페이스에 추가해 유저를 불러오세요!
        </Box>
        {user ? (
          <AddToSlackButton />
        ) : (
          <Box width="min(350px, 100%)">
            <SocialLogin />
          </Box>
        )}
      </Box>
    );
  }

  const groupSizeStat = memberPartition.groupSizeStat();
  const groupSizeStatLabel = groupSizeStat
    .map((stat) => `${stat.size}인조 ${stat.numberOfGroups}개`)
    .join(" / ");

  return (
    <Box display="flex" gap="10px" flexDirection="column">
      <Box display="flex" gap="2px" flexDirection="column" overflow="auto">
        {memberPartition.groups.map((users, index) => (
          <SingleGroupComponent
            groupIndex={index + indexOffset}
            users={users}
            key={index}
          />
        ))}
      </Box>
      <Divider flexItem />

      <Box
        display="flex"
        alignItems="center"
        flexDirection={isMobile ? "column" : "row"}
        gap="10px"
        justifyContent="flex-start"
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
      </Box>
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
    <Box display="flex" alignItems="center" gap="2px">
      <Box minWidth="40px">{groupIndex}조: </Box>
      {users.map((user) => (
        <Chip
          style={{ maxWidth: "200px", flexGrow: 1 }}
          label={user.nameWithStatus}
          key={user.id}
        />
      ))}
    </Box>
  );
};

const DisplayExcludedComponent = ({ users }: { users: NormalUser[] }) => {
  if (users.length === 0) return <div>제외된 유저가 없습니다.</div>;
  return (
    <Box>
      <div>제외된 유저:</div>
      <Box display="flex">
        {users.map((user) => (
          <Chip label={user.nameWithStatus} key={user.id} />
        ))}
      </Box>
    </Box>
  );
};
