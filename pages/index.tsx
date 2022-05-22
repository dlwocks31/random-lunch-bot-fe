import { Button, FormControl, TextField } from "@mui/material";
import type { NextPage } from "next";
import { useState } from "react";
import { RemoteUserViewer } from "../components/group/RemoteUserViewer";
import { SendSlackMessage } from "../components/message/SendSlackMessage";
import { TagEditor } from "../components/tag/TagEditor";
import { UnselectedUserViewer } from "../components/group/UnselectedUserViewer";
import { UserGrouper } from "../components/group/UserGrouper";
import { SlackUser } from "../utils/slack/slack-user";
import { SlackService } from "../utils/slack/slack.service";
const Home: NextPage = () => {
  const [oauthToken, setOauthToken] = useState("");
  const [users, setUsers] = useState<
    { user: SlackUser; selected: boolean; isRemote: boolean }[]
  >([]);
  // tag name -> user ids map
  const [tagMap, setTagMap] = useState<Map<string, string[]>>(new Map());

  function getUsersFromSlack() {
    const slackService = new SlackService(oauthToken);
    slackService.findAllValidSlackUsers().then((users) => {
      setUsers(
        users.map((u) => ({ user: u, selected: true, isRemote: false })),
      );
    });
  }

  function onRemoteUserChange(userIds: string[]) {
    setUsers((users) =>
      users.map((u) => {
        const isRemote = userIds.includes(u.user.id);
        return {
          ...u,
          selected: isRemote ? true : u.selected,
          isRemote,
        };
      }),
    );
  }

  function onUnselectUserChange(unselectedUserIds: string[]) {
    setUsers((users) =>
      users.map((u) => {
        const selected = !unselectedUserIds.includes(u.user.id);
        return {
          ...u,
          isRemote: selected ? u.isRemote : false,
          selected,
        };
      }),
    );
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
      <UserGrouper
        officeUsers={users
          .filter((u) => u.selected && !u.isRemote)
          .map((u) => u.user)}
        remoteUsers={users
          .filter((u) => u.selected && u.isRemote)
          .map((u) => u.user)}
        tagMap={tagMap}
      />
      <UnselectedUserViewer
        allUsers={users.map((u) => u.user)}
        unselectedUsers={users.filter((u) => !u.selected).map((u) => u.user)}
        onChange={onUnselectUserChange}
      />
      <RemoteUserViewer
        allUsers={users.map((u) => u.user)}
        remoteUsers={users.filter((u) => u.isRemote).map((u) => u.user)}
        onChange={onRemoteUserChange}
      />
      <TagEditor
        users={users.map((u) => u.user)}
        tagMap={tagMap}
        onTagMapChange={setTagMap}
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
