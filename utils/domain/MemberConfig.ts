import { SlackUser } from "../slack/slack-user";
import { MemberPartition } from "./MemberPartition";

export interface MemberConfig {
  office: MemberPartition;
  remote: MemberPartition;
  excluded: SlackUser[];
}
