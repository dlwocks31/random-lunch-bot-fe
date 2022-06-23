import { FlexTimeSlotType } from "./FlexTimeSlotType";

export interface FlexTimeSlot {
  type: FlexTimeSlotType;
  start: string;
  end: string;
}
