import { UsersListResponse } from "@slack/web-api";
import axios from "axios";
import { SlackUser } from "./slack-user";

const excludedName = ["Slackbot", "맘시터개발팀"];

export class SlackService {
  constructor(private slackToken: string) {}
  async findAllValidSlackUsers(): Promise<SlackUser[]> {
    // https://api.slack.com/methods/users.list
    const members = [];
    let cursor = undefined;
    while (true) {
      const formData =
        `token=${this.slackToken}&limit=200` +
        (cursor ? `&cursor=${cursor}` : "");
      const onePageUsers: UsersListResponse = (
        await axios.post("https://slack.com/api/users.list", formData)
      ).data;
      if (!onePageUsers.members) break;
      members.push(...onePageUsers.members);
      cursor = onePageUsers.response_metadata?.next_cursor;
      if (!cursor) break;
    }

    const ret = [];
    for (let member of members) {
      const displayName =
        member.profile?.display_name || member.profile?.real_name;
      const email = member.profile?.email;
      const id = member.id;
      if (!displayName || !email || !id) continue;
      if (member.is_bot || member.deleted || member.is_restricted) continue;
      if (excludedName.includes(displayName)) continue;
      ret.push(new SlackUser(id, displayName, email));
    }
    return ret;
  }
}
