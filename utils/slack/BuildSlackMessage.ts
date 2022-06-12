import { Partition } from "../domain/Partition";

export function buildSlackMessage(
  partition: Partition,
  baseMessage: string,
): string {
  const messageList = [];
  let groupNum = 1;
  for (const group of partition.groups) {
    const names = group.users.map((u) => `<@${u.id}> `).join(" ");
    messageList.push(`${groupNum}조: ${names} `);
    groupNum++;
  }
  const message = `${baseMessage}\n${messageList.join("\n")}`;
  return message;
}
