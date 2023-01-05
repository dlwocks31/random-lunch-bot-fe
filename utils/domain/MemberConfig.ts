import { createStandardPartition } from "../group/CreateStandardPartition";
import { NormalUser } from "../slack/NormalUser";
import { MemberPartition } from "./MemberPartition";
import { TagMap } from "./TagMap";

const DEFAULT_EACH_GROUP_USER = 4;
export class MemberConfig {
  constructor(
    public readonly office: MemberPartition,
    public readonly remote: MemberPartition,
    public readonly excluded: NormalUser[],
  ) {}

  static initializeFromUsers(users: NormalUser[]): MemberConfig {
    return new MemberConfig(
      new MemberPartition(
        createStandardPartition(
          users,
          Math.max(1, Math.floor(users.length / DEFAULT_EACH_GROUP_USER)),
        ),
        DEFAULT_EACH_GROUP_USER,
      ),
      new MemberPartition([], DEFAULT_EACH_GROUP_USER),
      [],
    );
  }

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

  optimizeByTagMap(tagMap: TagMap): MemberConfig {
    const office = this.office.optimizeByTagMap(tagMap);
    const remote = this.remote.optimizeByTagMap(tagMap);
    return new MemberConfig(office, remote, this.excluded);
  }

  moveMemberToOffice(member: NormalUser): MemberConfig {
    return new MemberConfig(
      this.office.add(member),
      this.remote.remove(member),
      this.excluded.filter((user) => user.id !== member.id),
    );
  }

  moveMemberToRemote(member: NormalUser): MemberConfig {
    return new MemberConfig(
      this.office.remove(member),
      this.remote.add(member),
      this.excluded.filter((user) => user.id !== member.id),
    );
  }

  moveMemberToExcluded(member: NormalUser): MemberConfig {
    const newExcluded = this.excluded.includes(member)
      ? this.excluded
      : this.excluded.concat(member);
    return new MemberConfig(
      this.office.remove(member),
      this.remote.remove(member),
      newExcluded,
    );
  }

  moveMembersToExcludedByEmail(emails: string[]): MemberConfig {
    const members = this.allUsers().filter((user) =>
      emails.includes(user.email),
    );
    return members.reduce(
      (acc, member) => acc.moveMemberToExcluded(member),
      this as MemberConfig,
    );
  }

  moveMembersToRemoteByEmail(emails: string[]): MemberConfig {
    const members = this.allUsers().filter((user) =>
      emails.includes(user.email),
    );
    return members.reduce(
      (acc, member) => acc.moveMemberToRemote(member),
      this as MemberConfig,
    );
  }

  moveMembersByEmail(
    toExcludedEmails: string[],
    toRemoteEmails: string[],
  ): MemberConfig {
    return this.moveMembersToExcludedByEmail(
      toExcludedEmails,
    ).moveMembersToRemoteByEmail(toRemoteEmails);
  }

  setOfficeGroupCount(count: number): MemberConfig {
    return new MemberConfig(
      this.office.changeGroupCount(count),
      this.remote,
      this.excluded,
    );
  }

  setRemoteGroupCount(count: number): MemberConfig {
    return new MemberConfig(
      this.office,
      this.remote.changeGroupCount(count),
      this.excluded,
    );
  }

  addOfficeUser(user: NormalUser): MemberConfig {
    return new MemberConfig(this.office.add(user), this.remote, this.excluded);
  }

  addRemoteUser(user: NormalUser): MemberConfig {
    return new MemberConfig(this.office, this.remote.add(user), this.excluded);
  }

  addExcludedUser(user: NormalUser): MemberConfig {
    return new MemberConfig(
      this.office,
      this.remote,
      this.excluded.concat(user),
    );
  }

  allUsers(): NormalUser[] {
    return this.office
      .users()
      .concat(this.remote.users())
      .concat(this.excluded);
  }

  isUserExcluded(id: string) {
    return this.excluded.some((user) => user.id === id);
  }

  isUserRemote(id: string) {
    return this.remote.hasUser(id);
  }
}
