import { Alert, Button, TextField } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "../../utils/network/Fetcher";

export function FlexUserFetcher({
  hasUser,
  addRemoteUsersByEmail,
  addUnselectedUsersByEmail,
  moveMembersByEmail,
}: {
  hasUser: boolean; // TODO: refactor: 도대체 component 노출 여부를 왜 여기서 제어..
  addRemoteUsersByEmail?: (emails: string[]) => void;
  addUnselectedUsersByEmail?: (emails: string[]) => void;
  moveMembersByEmail?: (
    toExcludedEmails: string[],
    toRemoteEmails: string[],
  ) => void;
}) {
  const [flexAid, setFlexAid] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [errorMessage, setErrorMessage] = useState("");
  const [flexFetchUrl, setFlexFetchUrl] = useState<string | null>(null);
  const { data } = useSWR(flexFetchUrl, fetcher);
  const { mutate } = useSWRConfig();
  useEffect(() => {
    console.log(data);
    console.log("HIHI data changed");
    if (data) {
      try {
        if (addRemoteUsersByEmail) {
          addRemoteUsersByEmail(data.remoteWork.map((d: any) => d.email));
        }
        if (addUnselectedUsersByEmail) {
          addUnselectedUsersByEmail(data.timeOff.map((d: any) => d.email));
        }
        if (moveMembersByEmail) {
          moveMembersByEmail(
            data.timeOff.map((d: any) => d.email),
            data.remoteWork.map((d: any) => d.email),
          );
        }
        setErrorMessage("");
      } catch (e) {
        setErrorMessage("에러가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    }
  }, [data]);

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

      {!!flexFetchUrl && !data ? (
        <Button disabled variant="outlined">
          Loading..
        </Button>
      ) : (
        <Button
          variant="outlined"
          onClick={() => {
            mutate(`/api/flex-users?flexAid=${flexAid}&date=${date}`);
            setFlexFetchUrl(`/api/flex-users?flexAid=${flexAid}&date=${date}`);
          }}
          size="small"
        >
          플렉스 설정 가져오기
        </Button>
      )}
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
