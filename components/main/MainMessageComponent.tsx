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
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import Select from "react-select";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { SlackConversation } from "../../utils/domain/SlackConversation";
import { mergeMemberConfigGroups } from "../../utils/group/MergeMemberConfigGroups";
import { isMomsitterEmail } from "../../utils/momsitter/IsMomsitterEmail";
import { MessageConfigRepository } from "../../utils/repository/MessageConfigRepository";
import { NormalUser } from "../../utils/slack/NormalUser";
import { MentionedUserGroup } from "../util/MentionedUserGroup";
import { UnmentionedUserGroup } from "../util/UnmentionedUserGroup";

const MOMSITTER_DEFAULT_TEMPLATE_MESSAGE = `오늘의 :orange_heart:*두런두런치*:orange_heart: 조를 발표합니다!
> 가장 앞에 있는 분이 이 채널에 조원들을 소환해서 스레드로 함께 메뉴를 정해주세요 :simple_smile:
> 맛있게 먹고 사진 찍고 <#C01BUJFGM4G> 방에 공유하는 것 잊지 마세요 :camera_with_flash:
`;

const DEFAULT_TEMPLATE_MESSAGE = `랜덤런치 조를 발표합니다!`;

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

  const user = useUser();

  useEffect(() => {
    if (isMomsitterEmail(user?.email)) {
      setPrefixMessage(MOMSITTER_DEFAULT_TEMPLATE_MESSAGE);
    }
  }, [user?.email]);

  const [shouldDisableMention, setShouldDisableMention] = useState<boolean>(
    !slackInstalled,
  );

  const membersSlackMessage = customBuildSlackMessage(
    members,
    shouldDisableMention,
  );
  const message = [prefixMessage, membersSlackMessage].join("\n");

  const { data: messageConfig } = useQuery(
    "message-config",
    async () => messageConfigRepository.load(),
    {
      staleTime: Infinity,
    },
  );

  useEffect(() => {
    if (messageConfig?.template) {
      setPrefixMessage(messageConfig.template);
    }
  }, [messageConfig]);

  useEffect(() => {
    if (slackInstalled) {
      setShouldDisableMention(false);
    }
  }, [slackInstalled]);

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
              defaultChannel={messageConfig?.channel}
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
    <Box display="flex" flexDirection="column" gap={1}>
      {slackInstalled && (
        <TextField
          label="메세지 템플릿"
          multiline
          fullWidth
          value={prefixMessage}
          onChange={(e) => setPrefixMessage(e.target.value)}
        />
      )}
      {!slackInstalled && (
        <div>
          아래 메세지를 복사해서 사용할 수 있습니다. 또는, 로그인과 슬랙 앱 연동
          후에, 아래 메세지를 슬랙에 전송할 수 있습니다.
        </div>
      )}
      <Box
        width="100%"
        border="1px solid #ccc"
        borderRadius="4px"
        padding="14.5px 14px"
        overflow="auto"
      >
        {mergedMembers.map((memberGroup) =>
          slackInstalled ? (
            <MentionedUserGroup memberGroup={memberGroup} />
          ) : (
            <UnmentionedUserGroup memberGroup={memberGroup} />
          ),
        )}
      </Box>
    </Box>
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
              placeholder={`메세지를 전송할 슬랙 채널을 선택하세요 (총 ${slackConversations.length}개)`}
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
