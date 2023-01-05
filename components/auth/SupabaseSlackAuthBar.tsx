import { AppBar, Toolbar, Typography, useMediaQuery } from "@mui/material";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Head from "next/head";
import { useSlackOauthStatus } from "../../utils/hooks/UseSlackOauthStatus";
import { isMomsitterEmail } from "../../utils/momsitter/IsMomsitterEmail";
import { AddToSlackButton } from "./AddToSlackButton";
import { LoginDialog } from "./LoginDialog";
import { LoginStatusPopper } from "./LoginStatusPopper";

export function SupabaseSlackAuthBar() {
  const user = useUser();

  const { slackTeamName, isLoading } = useSlackOauthStatus();

  const supabaseClient = useSupabaseClient();
  const documentTitle = isMomsitterEmail(user?.email)
    ? "두런두런치 봇"
    : "랜덤런치봇";

  const isMobile = useMediaQuery("(max-width: 600px)");
  return (
    <AppBar position="static">
      <Head>
        <title>{documentTitle}</title>
      </Head>
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>{documentTitle}</Typography>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {user ? (
            <>
              {!isLoading && !slackTeamName && !isMobile && (
                <AddToSlackButton />
              )}
              <LoginStatusPopper />
            </>
          ) : (
            <LoginDialog
              handleLogin={(email, password) => {
                supabaseClient.auth.signInWithPassword({ email, password });
              }}
            />
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
