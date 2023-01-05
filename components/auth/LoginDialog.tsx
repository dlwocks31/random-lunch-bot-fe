import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { GoogleSvg } from "../util/GoogleSvg";
import { SlackSvg } from "../util/SlackSvg";
export function LoginDialog({
  handleLogin,
}: {
  handleLogin: (email: string, password: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const supabaseClient = useSupabaseClient();
  const signInCallback = (provider: "slack" | "google") => {
    return () => {
      supabaseClient.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: process.env.NEXT_PUBLIC_REDIRECT_BACK_HOST,
        },
      });
    };
  };
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
        <Box display="flex" flexDirection="column" pl={3} pr={3} gap={1}>
          <Button variant="outlined" onClick={signInCallback("slack")}>
            <Box display="flex" alignItems="center" gap={1}>
              <SlackSvg />
              <div>슬랙으로 로그인</div>
            </Box>
          </Button>
          <Button variant="outlined" onClick={signInCallback("google")}>
            <Box display="flex" alignItems="center" gap={1}>
              <GoogleSvg />
              <div>구글로 로그인</div>
            </Box>
          </Button>
        </Box>

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
