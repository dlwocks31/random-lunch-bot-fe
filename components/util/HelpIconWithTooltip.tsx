import { IconButton, Tooltip } from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";

export function HelpIconWithTooltip({ title }: { title: string }) {
  return (
    <Tooltip title="플렉스에서 휴가자, 재택자 정보를 가져올 수 있습니다.">
      <IconButton disableRipple>
        <HelpIcon />
      </IconButton>
    </Tooltip>
  );
}
