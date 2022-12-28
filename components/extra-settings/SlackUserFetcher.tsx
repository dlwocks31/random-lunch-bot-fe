import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { useSession } from "@supabase/auth-helpers-react";
import { useState } from "react";
import Select from "react-select";
import { SlackConversation } from "../../utils/domain/SlackConversation";
import { NormalUser } from "../../utils/slack/NormalUser";
export const SlackUserFetcher = ({
  initialUsers,
  setUsers,
  conversations,
}: {
  initialUsers: NormalUser[];
  setUsers: (users: NormalUser[]) => void;
  conversations: SlackConversation[];
}) => {
  const [fetchType, setFetchType] = useState("all");

  const session = useSession();

  const setUsersByAll = async () => {
    setUsers(initialUsers);
  };

  const setUsersByChannel = async (channel: string) => {
    const memberIds: string[] = await fetch(
      `api/slack/conversation-members?channel=${channel}`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      },
    ).then((res) => res.json());
    const users: NormalUser[] = memberIds
      .map((id) => initialUsers.find((user) => user.id === id))
      .filter((user): user is NormalUser => user !== undefined);
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
