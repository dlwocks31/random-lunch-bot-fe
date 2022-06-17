import { Partition } from "../domain/Partition";

export function buildSlackMessage(
  partition: Partition,
  baseMessage: string,
  isUserMentioned: boolean,
): string {
  const messageList = [];
  let groupNum = 1;
  for (const group of partition.groups) {
    const names = isUserMentioned
      ? group.users.map((user) => `<@${user.id}>`).join(" ")
      : group.users.map((user) => user.displayName).join(" | ");
    messageList.push(`${groupNum}조: ${names} `);
    groupNum++;
  }
  const message = `${baseMessage}\n${messageList.join("\n")}`;
  return message;
}
