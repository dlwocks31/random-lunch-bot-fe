import { Button, TextField } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { LunchUser } from "../../utils/domain/LunchUser";

export function FlexUserFetcher({
  users,
  addRemoteUsersByEmail,
  addUnselectedUsersByEmail,
  onTagToUserIdMapChange,
}: {
  users: LunchUser[];
  addRemoteUsersByEmail: (emails: string[]) => void;
  addUnselectedUsersByEmail: (emails: string[]) => void;
  onTagToUserIdMapChange: (tagMap: Map<string, string[]>) => void;
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

  function getTag() {
    fetch(`/api/flex-users?flexAid=${flexAid}&date=${date}`)
      .then((response) => response.json())
      .then((data) => {
        const newTagMap: Map<string, string[]> = new Map();
        const setTag = (tag: string, userId: string) => {
          newTagMap.set(tag, [...(newTagMap.get(tag) || []), userId]);
        };
        const getUserId = (email: string) => {
          return users.find((u) => u.user.email === email)?.user.id;
        };
        const setByGroupType = (
          arr: { email: string; departments: string[] }[],
        ) => {
          for (const u of arr) {
            const uid = getUserId(u.email);
            if (!uid) continue;
            for (const d of u.departments) {
              setTag(d, uid);
            }
          }
        };
        setByGroupType(data.remoteWork);
        setByGroupType(data.timeOff);
        setByGroupType(data.officeWork);
        onTagToUserIdMapChange(newTagMap);
      });
  }

  return users.length === 0 ? null : (
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
      <Button onClick={getTag} size="small" variant="outlined">
        플렉스 정보로 태그 생성
      </Button>
      <style jsx>{`
        .root {
          display: flex;
          gap: 5px;
        }
      `}</style>
    </div>
  );
}
