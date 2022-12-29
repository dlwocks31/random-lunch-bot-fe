import { Dialog, DialogContent, DialogContentText } from "@mui/material";
import { useState } from "react";
import { AddToSlackButton } from "./AddToSlackButton";

export function SlackAppInstallDialog() {
  const [isOpened, setIsOpened] = useState(true);
  return (
    <Dialog open={isOpened} onClose={() => setIsOpened(false)}>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <DialogContentText>
          슬랙 앱을 설치해주세요. 슬랙 앱이 설치되면, 이 페이지에서 슬랙
          워크스페이스의 유저 정보를 가져올 수 있습니다.
        </DialogContentText>
        <AddToSlackButton />
      </DialogContent>
    </Dialog>
  );
}
