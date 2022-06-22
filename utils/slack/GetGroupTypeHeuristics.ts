import { GroupType } from "../domain/GroupType";
import { SlackUser } from "./slack-user";

export function getGroupTypeHeuristics(user: SlackUser): GroupType {
  // return user.statusEmoji === ":palm_tree:" ||
  //   user.statusMessage.includes("휴직")
  //   ? GroupType.EXCLUDED
  //   : user.statusEmoji === ":house_with_garden:"
  //   ? GroupType.REMOTE
  //   : GroupType.OFFICE;
  return user.statusMessage.includes("휴직")
    ? GroupType.EXCLUDED
    : GroupType.OFFICE;
}
