import { determineTimeslotOfTime } from "./DetermineTimeslotOfTime";
import { FlexTimeSlot } from "./FlexTimeSlot";
import { FlexTimeSlotType } from "./FlexTimeSlotType";

export function determineUserTypeFromSlots(
  timeslots: FlexTimeSlot[],
  workStarts: { type: FlexTimeSlotType; start: string }[],
  targetTime: string,
) {
  if (workStarts.length > 0) {
    return workStarts[0].type;
  }
  const timeslotOfTarget = determineTimeslotOfTime(timeslots, targetTime);
  return timeslotOfTarget;
}
