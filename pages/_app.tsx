import "@fontsource/roboto";
import { Box } from "@mui/material";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import Script from "next/script";
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XPCPT1MRMX"
          strategy="afterInteractive"
        />
        <Script id="gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XPCPT1MRMX');
          `}
        </Script>
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
