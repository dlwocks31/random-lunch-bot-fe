import { TextField } from "@mui/material";

export function TemplateMessageEditor({
  templateMessage,
  setTemplateMessage,
}: {
  templateMessage: string;
  setTemplateMessage: (templateMessage: string) => void;
}) {
  return (
    <div>
      <TextField
        label="슬랙 템플릿 메시지"
        id="slack-template-message"
        multiline
        fullWidth
        value={templateMessage}
        onChange={(e) => setTemplateMessage(e.target.value)}
      />
    </div>
  );
}
