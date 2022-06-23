import { GroupType } from "../domain/GroupType";
import { SlackUser } from "./slack-user";

export function getGroupTypeHeuristics(user: SlackUser): GroupType {

  return user.statusMessage.includes("휴직")
    ? GroupType.EXCLUDED
    : GroupType.OFFICE;
}
