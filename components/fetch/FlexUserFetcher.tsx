import { Alert, Button, TextField } from "@mui/material";
import dayjs from "dayjs";
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
      try {
        moveMembersByEmail(
          data.timeOff.map((d: any) => d.email),
          data.remoteWork.map((d: any) => d.email),
        );
        setErrorMessage("");
      } catch (e) {
        setErrorMessage("에러가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    }
  }, [data, isLoading]);

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

      {isLoading ? (
        <Button disabled variant="outlined">
          Loading..
        </Button>
      ) : (
        <Button
          variant="outlined"
          onClick={() => setFetchArgs({ flexAid, date, queryTime: new Date() })}
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
