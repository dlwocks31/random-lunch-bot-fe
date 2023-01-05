import { Box, Button } from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { GoogleSvg } from "../util/GoogleSvg";
import { SlackSvg } from "../util/SlackSvg";

export const SocialLogin = () => {
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
  );
};
