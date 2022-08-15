import { createStandardPartition } from "../group/CreateStandardPartition";
import { SlackUser } from "../slack/slack-user";

export class MemberPartition {
  constructor(
    public readonly groups: SlackUser[][],
    public readonly defaultGroupSize: number,
  ) {}

  userCount(): number {
    return this.groups.reduce((acc, group) => acc + group.length, 0);
  }

  groupCount(): number {
    return this.groups.length;
  }

  users(): SlackUser[] {
    return this.groups.reduce((acc, group) => acc.concat(group), []);
  }

  add(user: SlackUser): MemberPartition {
    const flatUsers = this.users();
    if (flatUsers.includes(user)) {
      return this;
    } else {
      flatUsers.push(user);
      console.log("At add, flatUsers: ", flatUsers);
      return new MemberPartition(
        createStandardPartition(
          flatUsers,
          Math.max(1, Math.floor(flatUsers.length / this.defaultGroupSize)),
        ),
        this.defaultGroupSize,
      );
    }
  }

  remove(user: SlackUser): MemberPartition {
    const flatUsers = this.users();
    if (flatUsers.includes(user)) {
      flatUsers.splice(flatUsers.indexOf(user), 1);
      return new MemberPartition(
        createStandardPartition(
          flatUsers,
          Math.max(1, Math.floor(flatUsers.length / this.defaultGroupSize)),
        ),
        this.defaultGroupSize,
      );
    } else {
      return this;
    }
  }

  changeDefaultGroupSize(newDefaultGroupSize: number): MemberPartition {
    return new MemberPartition(
      createStandardPartition(
        this.users(),
        Math.max(1, Math.floor(this.users().length / newDefaultGroupSize)),
      ),
      newDefaultGroupSize,
    );
  }
}
