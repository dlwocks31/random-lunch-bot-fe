import { SlackUser } from "../slack/slack-user";
import { MemberPartition } from "./MemberPartition";
import { TagMap } from "./TagMap";

export class MemberConfig {
  constructor(
    public readonly office: MemberPartition,
    public readonly remote: MemberPartition,
    public readonly excluded: SlackUser[],
  ) {}

  setOfficePartition(office: MemberPartition): MemberConfig {
    return new MemberConfig(office, this.remote, this.excluded);
  }

  setRemotePartition(remote: MemberPartition): MemberConfig {
    return new MemberConfig(this.office, remote, this.excluded);
  }

  shuffleByTagMap(tagMap: TagMap): MemberConfig {
    const office = this.office.shuffleByTagMap(tagMap);
    const remote = this.remote.shuffleByTagMap(tagMap);
    return new MemberConfig(office, remote, this.excluded);
  }

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
