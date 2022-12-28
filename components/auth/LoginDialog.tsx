import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { supabase } from "../../utils/supabase/supabaseClient";

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
        <Button
          variant="contained"
          sx={{ margin: "0 24px" }}
          onClick={() => {
            supabase.auth
              .signInWithOAuth({
                provider: "slack",
              })
              .then(({ data, error }) => {
                if (error) {
                  console.log("error", error);
                }
                if (data) {
                  console.log("data", data);
                }
              });
          }}
        >
          슬랙으로 로그인
        </Button>
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
