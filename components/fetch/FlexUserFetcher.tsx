import { Button, TextField } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";

export function FlexUserFetcher({
  hasUser,
  addRemoteUsersByEmail,
  addUnselectedUsersByEmail,
}: {
  hasUser: boolean;
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

  return hasUser ? (
    <div className="root">
      <TextField
        label="x-flex-aid"
        value={flexAid}
        onChange={(e) => setFlexAid(e.target.value)}
        size="small"
      />
      <TextField
        label="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        size="small"
      />
      <Button onClick={fetchApi} size="small" variant="outlined">
        플렉스 설정 가져오기
      </Button>
      <style jsx>{`
        .root {
          display: flex;
          gap: 5px;
        }
      `}</style>
    </div>
  ) : null;
}
