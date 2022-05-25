import { SlackUser } from "../slack/slack-user";

export interface LunchUser {
  user: SlackUser;
  selected: boolean;
  isRemote: boolean;
}
