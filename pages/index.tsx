import { Button, FormControl, TextField } from "@mui/material";
import type { NextPage } from "next";
import { useState } from "react";
import { SendSlackMessage } from "../components/SendSlackMessage";
import { UnselectedUserViewer } from "../components/UnselectedUserViewer";
import { UserGrouper } from "../components/UserGrouper";
import { SlackUser } from "../utils/slack/slack-user";
import { SlackService } from "../utils/slack/slack.service";
const Home: NextPage = () => {
  const [oauthToken, setOauthToken] = useState("");
  const [users, setUsers] = useState<{ user: SlackUser; selected: boolean }[]>(
    [],
  );
  function getUsersFromSlack() {
    const slackService = new SlackService(oauthToken);
    slackService.findAllValidSlackUsers().then((users) => {
      setUsers(users.map((u) => ({ user: u, selected: true })));
    });
  }
  function unselectUser(id: string) {
    setUsers((users) =>
      users.map((u) => ({
        user: u.user,
        selected: u.user.id === id ? false : u.selected,
      })),
    );
  }

  function onUnselectUserChange(unselectedUserIds: string[]) {
    const result = users.map((u) => ({
      user: u.user,
      selected: !unselectedUserIds.includes(u.user.id),
    }));
    setUsers(result);
  }

  function getSelectedUsers() {
    return users.filter((u) => u.selected).map((u) => u.user);
  }

  return (
    <div className="form-root">
      <FormControl className="form-control">
        <TextField
          className="text-field"
          id="bot-oauth-token"
          label="Bot OAuth Token"
          value={oauthToken}
          onChange={(e) => setOauthToken(e.target.value)}
        />
        <Button onClick={getUsersFromSlack}>Submit</Button>
      </FormControl>
      <UserGrouper users={getSelectedUsers()} unselectUserFn={unselectUser} />
      <UnselectedUserViewer
        allUsers={users.map((u) => u.user)}
        unselectedUsers={users.filter((u) => !u.selected).map((u) => u.user)}
        onChange={onUnselectUserChange}
      />
      <SendSlackMessage oauthToken={oauthToken} />
      <style jsx>{`
        .form-root {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 10px;
        }
        .form-control {
          display: flex;
        }
        .datagrid-container {
          height: 500px;
          display: flex;
        }
      `}</style>
    </div>
  );
};

export default Home;
