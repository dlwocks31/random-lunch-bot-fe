import { Box, Button, Collapse, useMediaQuery } from "@mui/material";
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
  initialUsers,
  conversations,
  tagMap,
  setTagMap,
}: {
  members: MemberConfig;
  setMembers: (members: MemberConfig) => void;
  conversations: SlackConversation[];
  tagMap: TagMap;
  setTagMap: (tagMap: TagMap) => void;
  initialUsers: NormalUser[];
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

  const extraSettings: {
    name: string;
    component: JSX.Element;
    onlyOnSlackInstalled: boolean;
  }[] = [
    {
      name: "유저 가져오는 채널 설정",
      component: (
        <SlackUserFetcher
          conversations={conversations}
          initialUsers={initialUsers}
          setUsers={initializeFromNewUsers}
        />
      ),
      onlyOnSlackInstalled: true,
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
      onlyOnSlackInstalled: true,
    },
    {
      name: "같은 조 피하기 설정",
      component: (
        <TagEditor users={allUsers} tagMap={tagMap} setTagMap={setTagMap} />
      ),
      onlyOnSlackInstalled: false,
    },
    {
      name: "유저 이모지 확인",
      component: <CheckSlackUserEmoji members={members} />,
      onlyOnSlackInstalled: true,
    },
  ];

  const extraSettingsDisplayed = extraSettings.filter((e) => {
    if (e.onlyOnSlackInstalled) {
      return conversations.length > 0;
    }
    return true;
  });

  const [extraSettingName, setExtraSettingName] = useState<string>(
    extraSettings[0].name,
  );
  const [isExtraSettingOpened, setIsExtraSettingOpened] =
    useState<boolean>(false);

  const isMobile = useMediaQuery("(max-width:600px)");
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
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          flexDirection={isMobile ? "column" : "row"}
          paddingTop={1}
        >
          <div>추가 설정:</div>
          {extraSettingsDisplayed.map((setting) => (
            <Box flexGrow={1} width={isMobile ? "100%" : undefined}>
              <Button
                sx={{
                  wordBreak: "keep-all",
                }}
                fullWidth
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
            </Box>
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
