import { cloneDeep, min, random, sum } from "lodash";

export function optimizePartition<T>(
  initialParition: T[][],
  trialCount: number,
  groupPenalty: (group: T[]) => number,
): T[][] {
  if (initialParition.length === 0) {
    return [];
  }
  const getPartitionPenalty = (partition: T[][]) =>
    sum(partition.map((a) => groupPenalty(a)));
  let bestPartition = initialParition;
  let bestPenalty = getPartitionPenalty(bestPartition);
  const loggedOptimizeHistory = [[-1, bestPenalty]];
  // simulated annealing technique
  for (let i = 0; i < trialCount; i++) {
    const temperature = bestPenalty + 1;
    const mutatedPartition = cloneDeep(bestPartition);
    for (let t = 0; t < temperature; t++) {
      let r1 = random(bestPartition.length - 1);
      let c1 = random(bestPartition[r1].length - 1);
      let r2 = random(bestPartition.length - 1);
      let c2 = random(bestPartition[r2].length - 1);
      const tmp = mutatedPartition[r1][c1];
      mutatedPartition[r1][c1] = mutatedPartition[r2][c2];
      mutatedPartition[r2][c2] = tmp;
    }
    const mutatedPenalty = getPartitionPenalty(mutatedPartition);
    if (mutatedPenalty < bestPenalty) {
      loggedOptimizeHistory.push([i, mutatedPenalty]);
      bestPartition = mutatedPartition;
      bestPenalty = mutatedPenalty;
    }
  }
  console.log(
    `Optimized for partition of length ${sum(
      initialParition.map((a) => a.length),
    )} / penalty history: ${JSON.stringify(loggedOptimizeHistory)}`,
  );
  return bestPartition;
}
