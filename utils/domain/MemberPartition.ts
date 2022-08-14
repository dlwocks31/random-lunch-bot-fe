import { SlackUser } from "../slack/slack-user";

export class MemberPartition {
  constructor(public readonly groups: SlackUser[][]) {}

  userCount(): number {
    return this.groups.reduce((acc, group) => acc + group.length, 0);
  }

  groupCount(): number {
    return this.groups.length;
  }
}
