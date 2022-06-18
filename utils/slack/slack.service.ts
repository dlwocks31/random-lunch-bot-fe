import { UsersListResponse } from "@slack/web-api";
import axios from "axios";
import { SlackUser } from "./slack-user";

const excludedName = ["Slackbot", "맘시터개발팀"];

export class SlackService {
  constructor(private slackToken: string) {}
  async send(
    message: string,
    channel: string,
  ): Promise<{ ok: boolean; error?: string }> {
    const formData = `token=${this.slackToken}&channel=${encodeURIComponent(
      channel,
    )}&text=${encodeURIComponent(message)}`;
    const result = (
      await axios.post("https://slack.com/api/chat.postMessage", formData)
    ).data;
    return { ok: result.ok, error: result.error };
  }

  async joinConversation(channel: string): Promise<{ ok: boolean }> {
    const formData = `token=${this.slackToken}&channel=${channel}`;
    const result = (
      await axios.post("https://slack.com/api/conversations.join", formData)
    ).data;
    return { ok: result.ok };
  }

  async listConversation(): Promise<
    { id: string; name: string; membersCount: number }[]
  > {
    // https://api.slack.com/methods/conversations.list
    const channels = [];
    let cursor = undefined;
    while (true) {
      const formData =
        `token=${this.slackToken}&limit=200` +
        (cursor ? `&cursor=${cursor}` : "");
      const onePageChannels: any = (
        await axios.post("https://slack.com/api/conversations.list", formData)
      ).data;
      console.log("onePageChannels", onePageChannels);
      console.log(onePageChannels);
      if (!onePageChannels.channels) break;
      channels.push(...onePageChannels.channels);
      cursor = onePageChannels.response_metadata?.next_cursor;
      if (!cursor) break;
    }

    const ret = [];
    for (let channel of channels) {
      if (channel.is_archived) continue;
      ret.push({
        id: channel.id,
        name: channel.name,
        membersCount: channel.num_members,
      });
    }
    return ret;
  }
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
      const statusEmoji = member.profile?.status_emoji || "";
      const statusMessage = member.profile?.status_text || "";
      if (!displayName || !email || !id) continue;
      if (member.is_bot || member.deleted || member.is_restricted) continue;
      if (excludedName.includes(displayName)) continue;
      ret.push(
        new SlackUser(id, displayName, email, statusEmoji, statusMessage),
      );
    }
    return ret;
  }
}
