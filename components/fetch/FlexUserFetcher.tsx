import { Alert, Button, TextField } from "@mui/material";
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
  const [errorMessage, setErrorMessage] = useState("");
  async function fetchApi() {
    const response = await fetch(
      `/api/flex-users?flexAid=${flexAid}&date=${date}`,
    );
    if (!response.ok) {
      setErrorMessage("에러가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    const data = await response.json();
    try {
      addRemoteUsersByEmail(data.remoteWork.map((d: any) => d.email));
      addUnselectedUsersByEmail(data.timeOff.map((d: any) => d.email));
      setErrorMessage("");
    } catch (e) {
      setErrorMessage("에러가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
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
      {errorMessage ? (
        <Alert severity="error" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      ) : null}
      <style jsx>{`
        .root {
          display: flex;
          gap: 5px;
        }
      `}</style>
    </div>
  ) : null;
}
