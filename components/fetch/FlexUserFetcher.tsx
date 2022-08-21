import { Alert, Button, TextField } from "@mui/material";
import dayjs from "dayjs";
import { map } from "lodash";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

export function FlexUserFetcher({
  hasUser,
  moveMembersByEmail,
}: {
  hasUser: boolean; // TODO: refactor: 도대체 component 노출 여부를 왜 여기서 제어..
  moveMembersByEmail: (
    toExcludedEmails: string[],
    toRemoteEmails: string[],
  ) => void;
}) {
  const [flexAid, setFlexAid] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [fetchArgs, setFetchArgs] = useState({
    flexAid,
    date,
    queryTime: new Date(), // 버튼 클릭 때마다, 그리고 버튼 클릭 떄만 새로운 query를 요청하기 위해 추가
  });
  const { data, isLoading } = useQuery(
    ["flex", fetchArgs],
    () =>
      fetch(
        `/api/flex-users?flexAid=${fetchArgs.flexAid}&date=${fetchArgs.date}`,
      ).then((res) => res.json()),
    { enabled: !!fetchArgs.flexAid },
  );
  useEffect(() => {
    console.log({ data, isLoading });
    console.log("HIHI data changed");
    if (data) {
      const userListDisplay = (list: any) => map(list, "name").join(", ");
      try {
        const { timeOff, remoteWork } = data;
        console.log({ timeOff, remoteWork });
        const newInfoMessage = `제외에 추가됨: ${userListDisplay(
          timeOff,
        )} / 재택에 추가됨: ${userListDisplay(remoteWork)}`;
        setInfoMessage(newInfoMessage);
        moveMembersByEmail(
          timeOff.map((d: any) => d.email),
          remoteWork.map((d: any) => d.email),
        );
        setErrorMessage("");
      } catch (e) {
        setErrorMessage("에러가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    }
  }, [data, isLoading]);

  return hasUser ? (
    <div className="root">
      <div className="form">
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

        {isLoading ? (
          <Button disabled variant="outlined">
            Loading..
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={() => {
              setErrorMessage("");
              setInfoMessage("");
              setFetchArgs({ flexAid, date, queryTime: new Date() });
            }}
            size="small"
          >
            플렉스 설정 가져오기
          </Button>
        )}
      </div>
      {errorMessage ? (
        <Alert severity="error" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      ) : null}
      {infoMessage ? (
        <Alert severity="info" onClose={() => setInfoMessage("")}>
          {infoMessage}
        </Alert>
      ) : null}

      <style jsx>{`
        .form {
          display: flex;
          gap: 5px;
        }
        .root {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
      `}</style>
    </div>
  ) : null;
}
