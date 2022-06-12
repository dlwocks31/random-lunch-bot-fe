import { SlackUser } from "../slack/slack-user";
import { GroupType } from "./GroupType";

export class Group {
  constructor(
    public readonly groupType: GroupType,
    public readonly users: SlackUser[],
  ) {}
}
