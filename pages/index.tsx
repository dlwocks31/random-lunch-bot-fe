import { Button, FormControl, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import type { NextPage } from "next";
import { useState } from "react";
import { SlackUser } from "../utils/slack/slack-user";
import { SlackService } from "../utils/slack/slack.service";

const Home: NextPage = () => {
  const [oauthToken, setOauthToken] = useState("");
  const [users, setUsers] = useState<SlackUser[]>([]);
  function getUsersFromSlack() {
    const slackService = new SlackService(oauthToken);
    slackService.findAllValidSlackUsers().then((users) => {
      alert(users);
      setUsers(users);
    });
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
