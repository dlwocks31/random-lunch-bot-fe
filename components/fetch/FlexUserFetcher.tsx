import { Button, TextField } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { LunchUser } from "../../utils/domain/LunchUser";

export function FlexUserFetcher({
  users,
  addRemoteUsersByEmail,
  addUnselectedUsersByEmail,
}: {
  users: LunchUser[];
  addRemoteUsersByEmail: (emails: string[]) => void;
  addUnselectedUsersByEmail: (emails: string[]) => void;
}) {
  const [flexAid, setFlexAid] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  function fetchApi() {
    fetch(`/api/flex-users?flexAid=${flexAid}&date=${date}`)
      .then((response) => response.json())
      .then((data) => {
        addRemoteUsersByEmail(data.remoteWork.map((d: any) => d.email));
        addUnselectedUsersByEmail(data.timeOff.map((d: any) => d.email));
      });
  }

  return users.length === 0 ? null : (
    <div>
      <TextField
        label="flex aid"
        value={flexAid}
        onChange={(e) => setFlexAid(e.target.value)}
      />
      <TextField
        label="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Button onClick={fetchApi}>Import setting from Flex</Button>
    </div>
  );
}
