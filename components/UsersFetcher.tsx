import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { useEffect, useState } from "react";
import { SlackUser } from "../utils/slack/slack-user";
import Select from "react-select";
import { SlackServiceFactory } from "../utils/slack/SlackServiceFactory";

export function UsersFetcher({
  setUsers,
}: {
  setUsers: (users: SlackUser[]) => void;
}) {
  const [fetchType, _setFetchType] = useState("all");
  const setFetchType = (fetchType: string) => {
    _setFetchType(fetchType);
    if (fetchType === "all") {
      setUsers(allSlackUsers);
    }
  };
  const [conversations, setConversations] = useState<
    { id: string; name: string; membersCount: number }[]
  >([]);
  const [allSlackUsers, setAllSlackUsers] = useState<SlackUser[]>([]);

  const getConversations = async () => {
    const slackService = await SlackServiceFactory();
    const conversations = await slackService.listConversation();
    setConversations(conversations);
  };

  useEffect(() => {
    getConversations();
    setUsersByAll();
  }, []);

  const setUsersByAll = async () => {
    const slackService = await SlackServiceFactory();
    const users = await slackService.findAllValidSlackUsers();
    setUsers(users);
    setAllSlackUsers(users);
  };

  const setUsersByChannel = async (channel: string) => {
    const slackService = await SlackServiceFactory();
    const memberIds = await slackService.getConversationMembers(channel);
    const members = memberIds
      .map((id) => allSlackUsers.find((user) => user.id === id))
      .filter((user): user is SlackUser => user !== undefined);
    setUsers(members);
  };

  return (
    <div>
      <h3>조원 설정</h3>
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

      <style jsx>
        {`
          h3 {
            margin: 0;
          }
        `}
      </style>
    </div>
  );
}
