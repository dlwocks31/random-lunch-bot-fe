import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";

export function LoginDialog({
  handleLogin,
}: {
  handleLogin: (email: string, password: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  return (
    <>
      <Button
        color="inherit"
        variant="outlined"
        onClick={() => setIsLoginDialogOpen(true)}
      >
        로그인
      </Button>
      <Dialog
        open={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
      >
        <DialogTitle>로그인</DialogTitle>
        <DialogContent>
          <TextField
            label="이메일"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="비밀번호"
            type="password"
            fullWidth
            variant="standard"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLoginDialogOpen(false)}>취소</Button>
          <Button onClick={() => handleLogin(email, password)}>로그인</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
