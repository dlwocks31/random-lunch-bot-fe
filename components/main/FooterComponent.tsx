import { Box, Link, Typography } from "@mui/material";

export const FooterComponent = () => (
  <Box
    display="flex"
    justifyContent="space-around"
    alignItems="center"
    bgcolor="primary.main"
    color="primary.contrastText"
    p={1}
  >
    <Typography variant="caption">
      <Link
        href="https://github.com/dlwocks31/random-lunch-bot-fe"
        color="inherit"
      >
        Github
      </Link>{" "}
      /{" "}
      <Link href="https://forms.gle/naUSrL2n7Rues5P88" color="inherit">
        피드백 주기
      </Link>
    </Typography>
  </Box>
);
