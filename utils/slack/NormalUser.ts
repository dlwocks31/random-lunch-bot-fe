import { SlackUser } from "./slack-user";

export class NormalUser {
  constructor(
    public readonly name: string,
    public readonly slackUser?: SlackUser,
  ) {}

  static fromSlackUser(slackUser: SlackUser): NormalUser {
    return new NormalUser(slackUser.displayName, slackUser);
  }

  get email(): string {
    return this.slackUser?.email || "";
  }

  get id(): string {
    return this.slackUser?.id || this.name;
  }
}
