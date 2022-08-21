import { shuffle } from "lodash";
import { createStandardPartition } from "../group/CreateStandardPartition";
import { optimizePartition } from "../group/OptimizePartition";
import { SlackUser } from "../slack/slack-user";
import { TagMap } from "./TagMap";

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

  shuffleByTagMap(tagMap: TagMap): MemberPartition {
    const userIdToTagsMap = tagMap.userIdToTagsMap();
    const shuffledUsers = shuffle(this.users());
    const newGroups = optimizePartition(
      createStandardPartition(shuffledUsers, this.groupCount()),
      1000,
      (team: SlackUser[]) => {
        let sumScore = 0;
        for (let i = 0; i < team.length; i++) {
          for (let j = i + 1; j < team.length; j++) {
            const u1 = team[i];
            const u2 = team[j];
            const tagsOfU1 = userIdToTagsMap[u1.id] || [];
            const tagsOfU2 = userIdToTagsMap[u2.id] || [];
            for (const t1 of tagsOfU1) {
              for (const t2 of tagsOfU2) {
                if (t1 === t2) {
                  // todo: use function call
                  sumScore += 1;
                }
              }
            }
          }
        }
        return sumScore;
      },
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
      console.log("ERROR");
      return this;
    }
    const minGroupSize = Math.floor(this.userCount() / newGroupCount);
    return new MemberPartition(
      createStandardPartition(this.users(), newGroupCount),
      Math.min(6, Math.max(3, minGroupSize)),
    );
  }
}
