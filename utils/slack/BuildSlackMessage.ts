import { SlackUser } from "./slack-user";

export function buildSlackMessage(
  groups: SlackUser[][],
  baseMessage: string,
): string {
  const messageList = [];
  let groupNum = 1;
  for (let users of groups) {
    const names = users.map((u) => `<@${u.id}> `).join(" ");
    messageList.push(`${groupNum}조: ${names} `);
    groupNum++;
  }
  const message = `${baseMessage}\n${messageList.join("\n")}`;
  return message;
}
