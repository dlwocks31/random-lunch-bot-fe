import { Box } from "@mui/material";

export const BorderedBox = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "rgba(0,0,0,0.12)",
        borderRadius: 1,
        padding: "10px",
      }}
    >
      {children}
    </Box>
  );
};
