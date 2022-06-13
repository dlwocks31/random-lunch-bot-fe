import { Button, Collapse } from "@mui/material";
import { useState } from "react";

export function CollapseContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [opened, setOpened] = useState(true);
  return (
    <div>
      <div className="top-bar">
        <h2 className="title">{title}</h2>
        <Button onClick={() => setOpened((open) => !open)}>
          {opened ? "닫기" : "열기"}
        </Button>
      </div>

      <Collapse in={opened}>
        <div className="collapse-item">{children}</div>
      </Collapse>
      <style jsx>
        {`
          .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid grey;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            padding: 0 20px;
          }
          .title {
            margin: 12px 0;
          }
          .collapse-item {
            border: 1px solid grey;
            border-top: 0px;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
            padding: 20px;
          }
        `}
      </style>
    </div>
  );
}
