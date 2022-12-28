import "@fontsource/roboto";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import "../styles/globals.css";

const queryClient = new QueryClient();
const theme = createTheme({
  palette: {
    primary: {
      main: "#FF7000",
      contrastText: "#fff",
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  );
}

export default MyApp;
