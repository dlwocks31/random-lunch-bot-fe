import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import Select from "react-select";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { SlackConversation } from "../../utils/domain/SlackConversation";
import { MessageConfigRepository } from "../../utils/repository/MessageConfigRepository";
import { NormalUser } from "../../utils/slack/NormalUser";

const DEFAULT_TEMPLATE_MESSAGE = `오늘의 :orange_heart:*두런두런치*:orange_heart: 조를 발표합니다!
> 가장 앞에 있는 분이 이 채널에 조원들을 소환해서 스레드로 함께 메뉴를 정해주세요 :simple_smile:
> 맛있게 먹고 사진 찍고 <#C01BUJFGM4G> 방에 공유하는 것 잊지 마세요 :camera_with_flash:
`;

export const MainMessageComponent = ({
  members,
  slackConfig: { slackInstalled, slackConversations },
}: {
  members: MemberConfig;
  slackConfig: {
    slackInstalled: boolean;
    slackConversations: SlackConversation[];
  };
}) => {
  const supabaseClient = useSupabaseClient();
  const messageConfigRepository = new MessageConfigRepository(supabaseClient);
  const [prefixMessage, setPrefixMessage] = useState<string>(
    DEFAULT_TEMPLATE_MESSAGE,
  );

  const [defaultChannel, setDefaultChannel] = useState<string | undefined>(
    undefined,
  );
  const [shouldDisableMention, setShouldDisableMention] = useState<boolean>(
    !slackInstalled,
  );

  const membersSlackMessage = customBuildSlackMessage(
    members,
    shouldDisableMention,
  );
  const message = [prefixMessage, membersSlackMessage].join("\n");

  useEffect(() => {
    if (slackInstalled) {
      setShouldDisableMention(false);
    }
  }, [slackInstalled]);

  useEffect(() => {
    (async () => {
      const config = await messageConfigRepository.load();
      if (config.template && prefixMessage === DEFAULT_TEMPLATE_MESSAGE) {
        setPrefixMessage(config.template);
      }
      if (config.channel) {
        setDefaultChannel(config.channel);
      }
    })();
  });

  return (
    <Box display="flex" gap={1} flexDirection="column">
      <Box flexGrow={2} flexBasis={0}>
        <MessageDisplayer
          slackInstalled={slackInstalled}
          prefixMessage={prefixMessage}
          setPrefixMessage={setPrefixMessage}
          members={members}
        />
      </Box>

      {slackInstalled && (
        <Box
          flexGrow={1}
          flexBasis={0}
          display="flex"
          flexDirection="column"
          justifyContent="end"
        >
          <div>
            <MessageSender
              message={message}
              slackConversations={slackConversations}
              prefixMessage={prefixMessage}
              defaultChannel={defaultChannel}
              messageConfigRepository={messageConfigRepository}
            />
          </div>
        </Box>
      )}
    </Box>
  );
};

const MessageDisplayer = ({
  slackInstalled,
  prefixMessage,
  setPrefixMessage,
  members,
}: {
  slackInstalled: boolean;
  prefixMessage: string;
  setPrefixMessage: (prefixMessage: string) => void;
  members: MemberConfig;
}) => {
  const mergedMembers = mergeMemberConfigGroups(members);
  return (
    <>
      {slackInstalled && (
        <TextField
          label="메세지 템플릿"
          multiline
          fullWidth
          value={prefixMessage}
          onChange={(e) => setPrefixMessage(e.target.value)}
        />
      )}

      <Box
        width="100%"
        border="1px solid #ccc"
        borderRadius="4px"
        padding="14.5px 14px"
        overflow="auto"
      >
        {mergedMembers.map((memberGroup) => (
          <Box display="flex" alignItems="center" key={memberGroup.groupLabel}>
            <div style={{ whiteSpace: "nowrap" }}>
              {memberGroup.groupLabel}:
            </div>
            {memberGroup.users.map((user) => (
              <div
                style={{
                  background: "rgba(29,155,209,.1)",
                  color: "rgba(18,100,163,1)",
                  margin: "0 2px",
                  padding: "2px",
                  borderRadius: "4px",
                  whiteSpace: "nowrap",
                }}
                key={user.name}
              >
                @{user.name}
              </div>
            ))}
          </Box>
        ))}
      </Box>
    </>
  );
};
const MessageSender = ({
  message,
  prefixMessage,
  slackConversations,
  defaultChannel,
  messageConfigRepository,
}: {
  message: string;
  prefixMessage: string;
  slackConversations: SlackConversation[];
  defaultChannel?: string;
  messageConfigRepository: MessageConfigRepository;
}) => {
  const [isConfirmDialogOpened, setIsConfirmDialogOpened] = useState(false);
  const [channel, setChannel] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  useEffect(() => {
    if (defaultChannel) {
      setChannel(defaultChannel);
    }
  }, [defaultChannel]);
  const sendSlackMessage = async () => {
    setIsSending(true);

    await fetch("/api/slack/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        channel,
      }),
    });
    setIsSending(false);
  };
  const channelDescription = () => {
    const conv = slackConversations.find((c) => c.id === channel);
    if (conv) {
      return `${conv.name} (멤버 ${conv.membersCount}명)`;
    }
    return "";
  };
  const makeValueFromChannel = (channel: string) => {
    const conv = slackConversations.find((c) => c.id === channel);
    if (conv) {
      return {
        value: conv.id,
        label: conv.name,
      };
    }
    return undefined;
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
          <div style={{ flex: "1 0 0" }}>
            <Select
              placeholder={`메세지를 전송할 채널을 선택하세요 (총 ${slackConversations.length}개)`}
              options={slackConversations.map(({ id, name }) => ({
                value: id,
                label: name,
              }))}
              onChange={(e) => setChannel(e?.value || "")}
              menuPlacement="auto"
              value={makeValueFromChannel(channel)}
            />{" "}
          </div>

          <div style={{ flex: "1 0 0" }}>
            <Button
              onClick={() => setIsConfirmDialogOpened(true)}
              variant="contained"
              fullWidth
              disabled={isSending || channel === ""}
            >
              위 채널로 메세지 전송
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={isConfirmDialogOpened}
        onClose={() => setIsConfirmDialogOpened(false)}
      >
        <DialogTitle>정말로 메세지를 전송하시겠습니까?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            슬랙 채널{" "}
            <span style={{ fontWeight: "bold" }}> {channelDescription()}</span>{" "}
            에 메세지를 전송합니다.
          </DialogContentText>

          <DialogActions>
            <Button
              onClick={() => setIsConfirmDialogOpened(false)}
              variant="outlined"
            >
              취소
            </Button>
            <Button
              onClick={() => {
                sendSlackMessage().then(() => {
                  setIsConfirmDialogOpened(false);
                  messageConfigRepository.save({
                    template: prefixMessage,
                    channel,
                  });
                });
              }}
              variant="contained"
              disabled={isSending}
            >
              메세지 전송
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

const mergeMemberConfigGroups = (
  members: MemberConfig,
): { groupLabel: string; users: NormalUser[] }[] => {
  const groups: { groupLabel: string; users: NormalUser[] }[] = [];
  let groupNum = 1;
  for (const users of members.office.groups) {
    groups.push({
      groupLabel: `${groupNum}조`,
      users,
    });
    groupNum++;
  }
  for (const users of members.remote.groups) {
    groups.push({
      groupLabel: `${groupNum}조`,
      users,
    });
    groupNum++;
  }
  return groups;
};

const customBuildSlackMessage = (
  members: MemberConfig,
  shouldDisableMention: boolean,
) => {
  const userToStr = (u: NormalUser) =>
    shouldDisableMention ? u.name : `<@${u.id}>`;
  const messageList = [];
  const groups = mergeMemberConfigGroups(members);
  for (const group of groups) {
    const groupMessage = group.users.map((u) => userToStr(u)).join(" ");
    messageList.push(`${group.groupLabel}: ${groupMessage}`);
  }
  return messageList.join("\n");
};
