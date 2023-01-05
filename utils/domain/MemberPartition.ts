import { shuffle } from "lodash";
import { createStandardPartition } from "../group/CreateStandardPartition";
import { optimizePartition } from "../group/OptimizePartition";
import { NormalUser } from "../slack/NormalUser";
import { simplePenaltyFunction } from "./SimplePenaltyFunction";
import { TagMap } from "./TagMap";

export class MemberPartition {
  constructor(
    public readonly groups: NormalUser[][],
    public readonly defaultGroupSize: number,
  ) {}

  userCount(): number {
    return this.groups.reduce((acc, group) => acc + group.length, 0);
  }

  groupCount(): number {
    return this.groups.length;
  }

  users(): NormalUser[] {
    return this.groups.reduce((acc, group) => acc.concat(group), []);
  }

  groupSizeStat(): { size: number; numberOfGroups: number }[] {
    const stat = this.groups.reduce((acc, group) => {
      const size = group.length;
      if (acc[size] === undefined) {
        acc[size] = 1;
      } else {
        acc[size] += 1;
      }
      return acc;
    }, {} as { [size: number]: number });
    return Object.keys(stat)
      .map((size) => ({ size: +size, numberOfGroups: stat[+size] }))
      .sort((a, b) => a.size - b.size);
  }

  add(user: NormalUser): MemberPartition {
    const flatUsers = this.users();
    if (flatUsers.includes(user)) {
      return this;
    } else {
      flatUsers.push(user);
      return new MemberPartition(
        createStandardPartition(
          flatUsers,
          Math.max(1, Math.floor(flatUsers.length / this.defaultGroupSize)),
        ),
        this.defaultGroupSize,
      );
    }
  }

  remove(user: NormalUser): MemberPartition {
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

  shuffleByTagMap(tagMap: TagMap): MemberPartition {
    const userIdToTagsMap = tagMap.userIdToTagsMap();
    const shuffledUsers = shuffle(this.users());
    const newGroups = optimizePartition(
      createStandardPartition(shuffledUsers, this.groupCount()),
      1000,
      (team: NormalUser[]) => simplePenaltyFunction(team, userIdToTagsMap),
    );
    return new MemberPartition(newGroups, this.defaultGroupSize);
  }

  optimizeByTagMap(tagMap: TagMap): MemberPartition {
    const userIdToTagsMap = tagMap.userIdToTagsMap();
    const newGroups = optimizePartition(
      this.groups,
      1000,
      (team: NormalUser[]) => simplePenaltyFunction(team, userIdToTagsMap),
    );
    return new MemberPartition(newGroups, this.defaultGroupSize);
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

  changeGroupCount(newGroupCount: number): MemberPartition {
    if (newGroupCount > this.userCount() || newGroupCount < 1) {
      return this;
    }
    const minGroupSize = Math.floor(this.userCount() / newGroupCount);
    return new MemberPartition(
      createStandardPartition(this.users(), newGroupCount),
      Math.min(6, Math.max(3, minGroupSize)),
    );
  }

  hasUser(id: string): boolean {
    return this.users().some((u) => u.id === id);
  }
}
