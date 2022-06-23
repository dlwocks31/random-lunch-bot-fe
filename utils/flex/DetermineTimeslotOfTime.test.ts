import { determineTimeslotOfTime } from "./DetermineTimeslotOfTime";
import { FlexTimeSlotType } from "./FlexTimeSlotType";

describe("DetermineTimeslotOfTime", () => {
  it("점심시간을 걸처 휴가 후 출근이라면, 출근으로 판정", () => {
    const time = "13:00";
    const timeslots = [
      {
        start: "09:00",
        end: "13:00",
        type: FlexTimeSlotType.TIME_OFF,
      },
      {
        start: "14:00",
        end: "18:00",
        type: FlexTimeSlotType.OFFICE_WORK,
      },
    ];
    const result = determineTimeslotOfTime(timeslots, time);
    expect(result).toBe(FlexTimeSlotType.OFFICE_WORK);
  });

  it("점심시간 전 후 모두 재택이라면 재택으로 판정", () => {
    const time = "13:00";
    const timeslots = [
      {
        start: "09:00",
        end: "13:00",
        type: FlexTimeSlotType.REMOTE_WORK,
      },
      {
        start: "14:00",
        end: "18:00",
        type: FlexTimeSlotType.REMOTE_WORK,
      },
    ];

    const result = determineTimeslotOfTime(timeslots, time);
    expect(result).toBe(FlexTimeSlotType.REMOTE_WORK);
  });
});
