import { SlackUser } from "../slack/slack-user";

export interface PartitionConfig {
  officeUsers: SlackUser[];
  remoteUsers: SlackUser[];
  excludedUsers: SlackUser[];
  officeGroupCount: number;
  remoteGroupCount: number;
  tagToUserIdsMap: Map<string, string[]>;
}
