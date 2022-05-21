import { Button, FormControl, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import type { NextPage } from "next";
import { useState } from "react";
import { SendSlackMessage } from "../components/SendSlackMessage";
import { UnselectedUserViewer } from "../components/UnselectedUserViewer";
import { UserGrouper } from "../components/UserGrouper";
import { SlackUser } from "../utils/slack/slack-user";
import { SlackService } from "../utils/slack/slack.service";

const Home: NextPage = () => {
  const [oauthToken, setOauthToken] = useState("");
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SlackUser[]>([]);
  function getUsersFromSlack() {
    const slackService = new SlackService(oauthToken);
    slackService.findAllValidSlackUsers().then((users) => {
      setUsers(users);
      setSelectedUsers(users);
    });
  }
  function getUnselectedUser() {
    return users.filter((u) => !selectedUsers.includes(u));
  }
  function unselectUser(id: string) {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== id));
  }

  function onUnselectUserChange(unselectedUserIds: string[]) {
    setSelectedUsers(users.filter((u) => !unselectedUserIds.includes(u.id)));
  }
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "displayName",
      headerName: "Name",
      width: 150,
    },
    {
      field: "email",
      headerName: "Email",
      width: 150,
    },
  ];
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
      <div className="datagrid-container">
        <DataGrid rows={users} columns={columns} />
      </div>
      <UserGrouper users={selectedUsers} unselectUserFn={unselectUser} />
      <UnselectedUserViewer allUsers={users} onChange={onUnselectUserChange} />
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
