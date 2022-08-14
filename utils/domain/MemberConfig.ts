import { SlackUser } from "../slack/slack-user";
import { MemberPartition } from "./MemberPartition";

export class MemberConfig {
  constructor(
    public readonly office: MemberPartition,
    public readonly remote: MemberPartition,
    public readonly excluded: SlackUser[],
  ) {}

  moveMemberToOffice(member: SlackUser): MemberConfig {
    return new MemberConfig(
      this.office.add(member),
      this.remote.remove(member),
      this.excluded.filter((user) => user.id !== member.id),
    );
  }

  moveMemberToRemote(member: SlackUser): MemberConfig {
    return new MemberConfig(
      this.office.remove(member),
      this.remote.add(member),
      this.excluded.filter((user) => user.id !== member.id),
    );
  }

  moveMemberToExcluded(member: SlackUser): MemberConfig {
    const newExcluded = this.excluded.includes(member)
      ? this.excluded
      : this.excluded.concat(member);
    return new MemberConfig(
      this.office.remove(member),
      this.remote.remove(member),
      newExcluded,
    );
  }

  allUsers(): SlackUser[] {
    return this.office
      .users()
      .concat(this.remote.users())
      .concat(this.excluded);
  }
}