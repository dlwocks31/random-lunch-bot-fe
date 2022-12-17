import {
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { useCallback, useState } from "react";
import Select from "react-select";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { SlackConversation } from "../../utils/domain/SlackConversation";
import { TagMap } from "../../utils/domain/TagMap";
import { NormalUser } from "../../utils/slack/NormalUser";
import { SlackUser } from "../../utils/slack/slack-user";
import { SlackServiceFactory } from "../../utils/slack/SlackServiceFactory";
import { generateTags } from "../../utils/tag/GenerateTags";
import { FlexUserFetcher } from "../fetch/FlexUserFetcher";
import { ExtraSettingViewer } from "../util/ExtraSettingViewer";
import { RootComponent } from "./RootComponent";

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
  const slackInstalled = conversations.length > 0;
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
      <RootComponent
        members={members}
        setMembers={setMembers}
        tagMap={tagMap}
      />
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
