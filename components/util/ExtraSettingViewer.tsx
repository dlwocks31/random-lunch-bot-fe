import { Button, Collapse } from "@mui/material";
import { useState } from "react";

export const ExtraSettingViewer = ({
  settingName,
  children,
}: {
  settingName: string;
  children: React.ReactNode;
}) => {
  const [isOpened, setIsOpened] = useState(false);
  return (
    <>
      <div className="root">
        <div className="title">{settingName}</div>
        <Button
          className="button"
          variant="outlined"
          onClick={() => setIsOpened((open) => !open)}
          fullWidth
        >
          {settingName} {isOpened ? "숨기기" : "보기"}
        </Button>
      </div>
      <Collapse in={isOpened}>{children}</Collapse>
      <style jsx>{`
        .root {
          display: flex;
          gap: 10px;
          align-items: center;
          margin: 5px 0;
        }
        .title {
          width: 175px;
        }
      `}</style>
    </>
  );
};
