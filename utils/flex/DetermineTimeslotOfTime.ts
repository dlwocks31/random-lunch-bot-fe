import { sortBy } from "lodash";
import { FlexTimeSlot } from "./FlexTimeSlot";
import { FlexTimeSlotType } from "./FlexTimeSlotType";

export function determineTimeslotOfTime(
  timeslots: FlexTimeSlot[],
  time: string,
): FlexTimeSlotType {
  if (timeslots.length === 0) {
    return FlexTimeSlotType.OFFICE_WORK;
  }
  const containedTimeslot = timeslots.find(
    (t) => t.start < time && time < t.end,
  );
  if (containedTimeslot) {
    return containedTimeslot.type;
  }
  const firstTimeslotAfterTime = sortBy(timeslots, "start").find(
    (t) => t.start >= time,
  );
  return firstTimeslotAfterTime
    ? firstTimeslotAfterTime.type
    : FlexTimeSlotType.OFFICE_WORK;
}
