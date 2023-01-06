import "@fontsource/roboto";
import { Box } from "@mui/material";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { FooterComponent } from "../components/main/FooterComponent";
import "../styles/globals.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <QueryClientProvider client={queryClient}>
        <Box display="flex" flexDirection="column" minHeight="100vh">
          <Box flex={1}>
            <Component {...pageProps} />
          </Box>
          <FooterComponent />
        </Box>
      </QueryClientProvider>
    </SessionContextProvider>
  );
}

export default MyApp;
