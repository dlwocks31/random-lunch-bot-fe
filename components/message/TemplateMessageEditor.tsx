import { Button, TextField } from "@mui/material";

export function TemplateMessageEditor({
  templateMessage,
  setTemplateMessage,
  setTemplateMessageToDefault,
}: {
  templateMessage: string;
  setTemplateMessage: (templateMessage: string) => void;
  setTemplateMessageToDefault: () => void;
}) {
  return (
    <div className="root">
      <TextField
        label="슬랙 템플릿 메시지"
        id="slack-template-message"
        multiline
        fullWidth
        value={templateMessage}
        onChange={(e) => setTemplateMessage(e.target.value)}
      />
      <Button onClick={setTemplateMessageToDefault}>
        템플릿 기본값으로 설정
      </Button>
    </div>
  );
}
