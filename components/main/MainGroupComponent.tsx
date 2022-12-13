import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { useCallback, useState } from "react";
import Select from "react-select";
import Creatable from "react-select/creatable";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { MemberPartition } from "../../utils/domain/MemberPartition";
import { SlackConversation } from "../../utils/domain/SlackConversation";
import { TagMap } from "../../utils/domain/TagMap";
import { NormalUser } from "../../utils/slack/NormalUser";
import { SlackUser } from "../../utils/slack/slack-user";
import { SlackServiceFactory } from "../../utils/slack/SlackServiceFactory";
import { generateTags } from "../../utils/tag/GenerateTags";
import { FlexUserFetcher } from "../fetch/FlexUserFetcher";
import { EachGroupSizeEditor } from "../group/EachGroupSizeEditor";
import { ExtraSettingViewer } from "../util/ExtraSettingViewer";

export const MainGroupComopnent = ({
  onStepIncrement,
  members,
  setMembers,
  conversations,
  tagMap,
  setTagMap,
}: {
  onStepIncrement: () => void;
  members: MemberConfig;
  setMembers: (members: MemberConfig) => void;
  conversations: SlackConversation[];
  tagMap: TagMap;
  setTagMap: (tagMap: TagMap) => void;
}) => {
  const allUsers = members.allUsers();
  const [tabIndex, setTabIndex] = useState(0);

  const initializeFromNewUsers = useCallback((users: NormalUser[]) => {
    console.log("initializeFromNewUsers", users);
    const newTagMap = new TagMap(generateTags(users));
    setTagMap(newTagMap);
    setMembers(
      MemberConfig.initializeFromUsers(users).shuffleByTagMap(newTagMap),
    );
  }, []);
  return (
    <div>
      <h2>조원 설정</h2>
      <hr />
      <div>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={(event: React.SyntheticEvent, newValue: number) => {
              setTabIndex(newValue);
            }}
            centered
          >
            <Tab
              label={`사무실 - 총 ${members.office.userCount()}명 / ${members.office.groupCount()}조`}
            />
            <Tab
              label={`재택 - 총 ${members.remote.userCount()}명 / ${members.remote.groupCount()}조`}
            />
            <Tab label={`제외 - 총 ${members.excluded.length}명`} />
          </Tabs>
        </Box>
        {tabIndex === 0 && (
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
            onShuffle={() => setMembers(members.shuffleByTagMap(tagMap))}
          />
        )}
        {tabIndex === 1 && (
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
            onShuffle={() => setMembers(members.shuffleByTagMap(tagMap))}
          />
        )}
        {tabIndex === 2 && (
          <UsersListComponent
            users={members.excluded}
            groupTypeName="제외"
            allUsers={allUsers}
            onAddGroupUser={(user) =>
              setMembers(members.moveMemberToExcluded(user))
            }
          />
        )}
      </div>
      <h2>추가 설정</h2>
      <hr />
      <ExtraSettingViewer settingName="유저 가져오는 채널">
        <CustomUsersFetcher
          conversations={conversations}
          setUsers={initializeFromNewUsers}
        />
      </ExtraSettingViewer>

      <ExtraSettingViewer settingName="flex 연동 설정">
        <FlexUserFetcher
          hasUser
          moveMembersByEmail={(
            toExcludedEmails: string[],
            toRemoteEmails: string[],
          ) => {
            setMembers(
              members.moveMembersByEmail(toExcludedEmails, toRemoteEmails),
            );
          }}
        />
      </ExtraSettingViewer>
      <CustomTagEditor users={allUsers} tagMap={tagMap} setTagMap={setTagMap} />

      <ExtraSettingViewer settingName="유저 이모지 확인">
        <div>
          슬랙 이모지와 일치하지 않는 상태에 있는 유저는 빨간색으로 표시됩니다.
        </div>
        <div>
          <span>🏡 상태 이모지를 가진 유저 - </span>
          {usersToNode(
            allUsers.filter(
              (user) => user.slackUser?.statusEmoji === ":house_with_garden:",
            ),
            (u) => !members.isUserRemote(u.id),
          )}
        </div>
        <div>
          <span>🌴 상태 이모지를 가진 유저 - </span>
          {usersToNode(
            allUsers.filter(
              (user) => user.slackUser?.statusEmoji === ":palm_tree:",
            ),
            (u) => !members.isUserExcluded(u.id),
          )}
        </div>
      </ExtraSettingViewer>

      <Button variant="contained" onClick={onStepIncrement} fullWidth>
        다음 단계로 {">"}
      </Button>
      <style jsx>
        {`
          .extra-container {
            display: flex;
          }
        `}
      </style>
    </div>
  );
};

const usersToNode = (
  users: NormalUser[],
  isHighlighted: (u: NormalUser) => boolean,
) => {
  if (users.length === 0) {
    return <span>없음</span>;
  }
  return users
    .map<React.ReactNode>((u) => (
      <>
        <span key={u.id} className={isHighlighted(u) ? "red" : ""}>
          {u.name}
        </span>
        <style jsx>
          {`
            .red {
              color: red;
            }
          `}
        </style>
      </>
    ))
    .reduce((prev, curr) => [prev, " ", curr]);
};

const CustomGroupCountEditor = ({
  groupCount,
  setGroupCount,
}: {
  groupCount: number;
  setGroupCount: (groupCount: number) => void;
}) => {
  return (
    <div className="root">
      <div className="edit-root">
        <IconButton onClick={() => setGroupCount(groupCount - 1)} size="small">
          <RemoveIcon />
        </IconButton>
        <div>{groupCount}</div>
        <IconButton onClick={() => setGroupCount(groupCount + 1)} size="small">
          <AddIcon />
        </IconButton>
      </div>

      <style jsx>{`
        .edit-root {
          display: flex;
          align-items: center;
          gap: 5px;
          border: 1px solid #1976d2;
          border-radius: 5px;
        }
        .root {
          display: flex;
          gap: 10px;
          align-items: center;
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
};

const CustomUserGroupTypeSelector = ({
  allUsers,
  includedUsers,
  addGroupUser,
}: {
  allUsers: NormalUser[];
  includedUsers: NormalUser[];
  addGroupUser: (user: NormalUser) => void;
}) => {
  const unselectedUsers = allUsers.filter(
    (u) => !includedUsers.some((su) => su.id === u.id),
  );
  return (
    <div>
      <Select
        placeholder="유저 이름을 검색하세요"
        options={unselectedUsers.map(({ id, name }) => ({
          value: id,
          label: name,
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

const CreatableUserGroupTypeSelector = ({
  allUsers,
  includedUsers,
  addGroupUser,
  createGroupUser,
}: {
  allUsers: NormalUser[];
  includedUsers: NormalUser[];
  addGroupUser: (user: NormalUser) => void;
  createGroupUser: (name: string) => void;
}) => {
  const unselectedUsers = allUsers.filter(
    (u) => !includedUsers.some((su) => su.id === u.id),
  );
  return (
    <div>
      <Creatable
        placeholder="유저 이름을 검색하세요"
        options={unselectedUsers.map(({ id, name }) => ({
          value: id,
          label: name,
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
        onCreateOption={createGroupUser}
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
  onShuffle,
}: {
  partition: MemberPartition;
  allUsers: NormalUser[];
  groupTypeName: string;
  onAddGroupUser: (user: NormalUser) => void;
  setPartition: (partition: MemberPartition) => void;
  onShuffle: () => void;
}) => (
  <div className="root">
    <div className="row">
      <div> 조별 최소 인원 수: </div>
      <EachGroupSizeEditor
        eachGroupSize={partition.defaultGroupSize}
        setEachGroupSize={(eachGroupSize) =>
          setPartition(partition.changeDefaultGroupSize(eachGroupSize))
        }
      />
    </div>
    <div className="row">
      <div>조 개수:</div>
      <CustomGroupCountEditor
        groupCount={partition.groupCount()}
        setGroupCount={(groupCount) =>
          setPartition(partition.changeGroupCount(groupCount))
        }
      />
    </div>
    <div className="row">
      <div>{groupTypeName} 인원 추가:</div>
      <CreatableUserGroupTypeSelector
        allUsers={allUsers}
        includedUsers={partition.users()}
        addGroupUser={onAddGroupUser}
        createGroupUser={(name: string) =>
          setPartition(partition.add(new NormalUser(name)))
        }
      />
    </div>
    <div>
      {partition.groups.map((group, i) => (
        <div key={i} className="group-container">
          <div>{i + 1}조:</div>
          {group.map((user) => (
            <Chip key={user.id} label={user.nameWithStatus} />
          ))}
        </div>
      ))}
    </div>
    <Button variant="outlined" fullWidth onClick={onShuffle}>
      재추첨
    </Button>
    <style jsx>{`
      .group-container {
        display: flex;
        gap: 3px;
        align-items: center;
        padding: 2px 0;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .root {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
    `}</style>
  </div>
);

const UsersListComponent = ({
  users,
  allUsers,
  groupTypeName,
  onAddGroupUser,
}: {
  users: NormalUser[];
  allUsers: NormalUser[];
  groupTypeName: string;
  onAddGroupUser: (user: NormalUser) => void;
}) => (
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
        <Chip key={user.id} label={user.name} />
      ))}
    </div>
  </div>
);

const CustomTagEditor = ({
  users,
  tagMap,
  setTagMap,
}: {
  users: NormalUser[];
  tagMap: TagMap;
  setTagMap: (tagMap: TagMap) => void;
}) => {
  const [newTagName, setNewTagName] = useState("");
  return (
    <ExtraSettingViewer settingName="같은 조 피하기 설정">
      <div>
        <div>Tags: </div>
        {Object.entries(tagMap.tagToUserIdsMap()).map(([tag, userIds]) => (
          <div key={tag} className="each-tag-container">
            <Chip label={tag} />
            <Select
              isMulti
              options={users.map(({ id, name }) => ({
                value: id,
                label: name,
              }))}
              value={userIds.map((id) => {
                const user = users.find((u) => u.id === id);
                return {
                  value: id,
                  label: user?.name || "",
                };
              })}
              onChange={(e) => {
                const userIds = e.map((e) => e.value);
                setTagMap(tagMap.setUserIdsOfTag(tag, userIds));
              }}
            />
          </div>
        ))}
      </div>
      <div className="new-tag-container">
        <div>태그 이름 추가하기:</div>
        <TextField
          label="태그 이름"
          size="small"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setTagMap(tagMap.setNewTag(newTagName));
              setNewTagName("");
            }
          }}
        />
      </div>
      <style jsx>{`
        .new-tag-container {
          display: flex;
        }
        .each-tag-container {
          display: flex;
          gap: 10px;
        }
        .tag-preview {
          display: flex;
          align-items: center;
          gap: 2px;
        }
      `}</style>
    </ExtraSettingViewer>
  );
};

const CustomUsersFetcher = ({
  setUsers,
  conversations,
}: {
  setUsers: (users: NormalUser[]) => void;
  conversations: SlackConversation[];
}) => {
  const [fetchType, setFetchType] = useState("all");

  const setUsersByAll = async () => {
    const slackService = await SlackServiceFactory();
    const allSlackUsers = await slackService.findAllValidSlackUsers();
    const allUsers = allSlackUsers.map(NormalUser.fromSlackUser);
    setUsers(allUsers);
  };

  const setUsersByChannel = async (channel: string) => {
    const slackService = await SlackServiceFactory();
    const memberIds = await slackService.getConversationMembers(channel);
    const allUsers = await slackService.findAllValidSlackUsers();
    const slackUsers: SlackUser[] = memberIds
      .map((id) => allUsers.find((user) => user.id === id))
      .filter((user): user is SlackUser => user !== undefined);
    const users = slackUsers.map(NormalUser.fromSlackUser);
    setUsers(users);
  };
  return (
    <div>
      <FormControl>
        <FormLabel>조원을 어떻게 가져올까요?</FormLabel>
        <RadioGroup
          value={fetchType}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFetchType(event.target.value);
          }}
        >
          <FormControlLabel
            value="all"
            control={<Radio />}
            label="워크스페이스의 모든 유저 가져오기"
            onClick={setUsersByAll}
          />
          <FormControlLabel
            value="from-channel"
            control={<Radio />}
            label="특정 채널에서 가져오기"
          />
        </RadioGroup>
        {fetchType === "from-channel" && (
          <div style={{ marginLeft: "30px" }}>
            <Select
              placeholder={`조원을 가져올 채널을 선택해 주세요 (총 ${conversations.length}개)`}
              options={conversations.map(({ id, name }) => ({
                value: id,
                label: name,
              }))}
              onChange={(event) => {
                if (event) {
                  const ch: string = event.value;
                  setUsersByChannel(ch);
                }
              }}
            />
          </div>
        )}
      </FormControl>
    </div>
  );
};
