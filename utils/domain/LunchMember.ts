import { SlackUser } from "../slack/slack-user";
import { GroupType } from "./GroupType";

export class LunchMember {
  constructor(
    public readonly user: SlackUser,
    public readonly groupType: GroupType,
  ) {}

  public isOffice(): boolean {
    return this.groupType === GroupType.OFFICE;
  }

  public isRemote(): boolean {
    return this.groupType === GroupType.REMOTE;
  }

  public isExcluded(): boolean {
    return this.groupType === GroupType.EXCLUDED;
  }
}
