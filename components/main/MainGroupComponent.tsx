import { Box, Button, Collapse } from "@mui/material";
import { useCallback, useState } from "react";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { SlackConversation } from "../../utils/domain/SlackConversation";
import { TagMap } from "../../utils/domain/TagMap";
import { NormalUser } from "../../utils/slack/NormalUser";
import { generateTags } from "../../utils/tag/GenerateTags";
import { CheckSlackUserEmoji } from "../extra-settings/CheckSlackUserEmoji";
import { FlexUserFetcher } from "../extra-settings/FlexUserFetcher";
import { SlackUserFetcher } from "../extra-settings/SlackUserFetcher";
import { TagEditor } from "../extra-settings/TagEditor";
import { BorderedBox } from "../util/BorderedBox";
import { MainMessageComponent } from "./MainMessageComponent";
import { RootComponent } from "./RootComponent";

export const MainGroupComopnent = ({
  members,
  setMembers,
  conversations,
  tagMap,
  setTagMap,
}: {
  members: MemberConfig;
  setMembers: (members: MemberConfig) => void;
  conversations: SlackConversation[];
  tagMap: TagMap;
  setTagMap: (tagMap: TagMap) => void;
}) => {
  const allUsers = members.allUsers();

  const initializeFromNewUsers = useCallback((users: NormalUser[]) => {
    console.log("initializeFromNewUsers", users);
    const newTagMap = new TagMap(generateTags(users));
    setTagMap(newTagMap);
    setMembers(
      MemberConfig.initializeFromUsers(users).shuffleByTagMap(newTagMap),
    );
  }, []);

  const extraSettings: { name: string; component: JSX.Element }[] = [
    {
      name: "유저 가져오는 채널 설정",
      component: (
        <SlackUserFetcher
          conversations={conversations}
          setUsers={initializeFromNewUsers}
        />
      ),
    },
    {
      name: "flex 연동 설정",
      component: (
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
      ),
    },
    {
      name: "같은 조 피하기 설정",
      component: (
        <TagEditor users={allUsers} tagMap={tagMap} setTagMap={setTagMap} />
      ),
    },
    {
      name: "유저 이모지 확인",
      component: <CheckSlackUserEmoji members={members} />,
    },
  ];

  const [extraSettingName, setExtraSettingName] = useState<string>(
    extraSettings[0].name,
  );
  const [isExtraSettingOpened, setIsExtraSettingOpened] =
    useState<boolean>(false);

  return (
    <div>
      <h2>조원 설정</h2>
      <hr />
      <RootComponent
        members={members}
        setMembers={setMembers}
        tagMap={tagMap}
      />
      <div>
        <Box display="flex" alignItems="center" gap={1} paddingTop={1}>
          <div>추가 설정:</div>
          {extraSettings.map((setting) => (
            <Button
              sx={{ flexGrow: 1, maxWidth: "200px" }}
              key={setting.name}
              variant={
                setting.name === extraSettingName && isExtraSettingOpened
                  ? "contained"
                  : "outlined"
              }
              onClick={() => {
                if (setting.name === extraSettingName) {
                  setIsExtraSettingOpened(!isExtraSettingOpened);
                } else {
                  setExtraSettingName(setting.name);
                  setIsExtraSettingOpened(true);
                }
              }}
            >
              {setting.name}
            </Button>
          ))}
        </Box>
        <Collapse
          in={isExtraSettingOpened}
          sx={{ marginTop: "8px", marginBottom: "16px" }}
        >
          <BorderedBox>
            {
              extraSettings.find((setting) => setting.name === extraSettingName)
                ?.component
            }
          </BorderedBox>
        </Collapse>
      </div>

      <h2>메세지 전송하기</h2>
      <hr />
      <MainMessageComponent
        members={members}
        slackConfig={{
          slackInstalled: conversations.length > 0,
          slackConversations: conversations,
        }}
      />
    </div>
  );
};
