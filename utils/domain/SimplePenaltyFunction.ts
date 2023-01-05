import { NormalUser } from "../slack/NormalUser";

export const simplePenaltyFunction = (
  team: NormalUser[],
  userIdToTagsMap: { [key: string]: string[] },
): number => {
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
            sumScore += 1;
          }
        }
      }
    }
  }
  return sumScore;
};
