import { FlexTimeSlotType } from "./FlexTimeSlotType";
import { parseSingleWorkScheduleResult } from "./ParseSingleWorkScheduleResult";

describe("ParseSingleWorkScheduleResult", () => {
  it("근무가 등록되어 있고, 따로 재택근무로 시작을 누른 경우", () => {
    const data = {
      userIdHash: "k1EBdBYm0y",
      days: [
        {
          date: "2022-11-23",
          workRecords: [
            {
              customerWorkFormId: "1071",
              blockTimeFrom: { timeStamp: 1669158000000 },
              blockTimeTo: { timeStamp: 1669176000000 },
            },
            {
              customerWorkFormId: "1074",
              blockTimeFrom: { timeStamp: 1669176000000 },
              blockTimeTo: { timeStamp: 1669179600000 },
            },
            {
              customerWorkFormId: "1071",
              blockTimeFrom: { timeStamp: 1669179600000 },
              blockTimeTo: { timeStamp: 1669190400000 },
            },
          ],
          timeOffs: [],
          workStartRecords: [
            {
              customerWorkFormId: "1073",
              blockTimeFrom: { zoneId: "Asia/Seoul", timeStamp: 1669162740000 },
            },
          ],
        },
      ],
    };
    const result = parseSingleWorkScheduleResult(data, "2022-11-23");
    expect(result).toEqual({
      flexId: "k1EBdBYm0y",
      timeslots: [
        {
          type: FlexTimeSlotType.OFFICE_WORK,
          start: "08:00",
          end: "13:00",
        },
        {
          type: FlexTimeSlotType.OFFICE_WORK,
          start: "14:00",
          end: "17:00",
        },
      ],
      workStarts: [
        {
          type: FlexTimeSlotType.REMOTE_WORK,
          start: "09:19",
        },
      ],
    });
  });

  it("종일 연차를 사용한 경우", () => {
    const data = {
      userIdHash: "k1EBdBYm0y",
      days: [
        {
          date: "2022-11-23",
          workRecords: [],
          timeOffs: [{ timeOffRegisterUnit: "DAY" }],
          workStartRecords: [],
        },
      ],
    };
    const result = parseSingleWorkScheduleResult(data, "2022-11-23");

    expect(result).toEqual({
      flexId: "k1EBdBYm0y",
      timeslots: [
        {
          type: FlexTimeSlotType.TIME_OFF,
          start: "00:00",
          end: "23:59",
        },
      ],
      workStarts: [],
    });
  });

  it("오후 반차를 사용한 경우", () => {
    const data = {
      userIdHash: "k1EBdBYm0y",
      days: [
        {
          date: "2022-11-23",
          workRecords: [
            {
              customerWorkFormId: "1071",
              blockTimeFrom: { timeStamp: 1669167000000 },
              blockTimeTo: { timeStamp: 1669176000000 },
            },
          ],
          timeOffs: [
            {
              timeOffRegisterUnit: "HOUR",
              blockTimeFrom: { timeStamp: 1669176000000 },
              blockTimeTo: { timeStamp: 1669199400000 },
            },
          ],
          workStartRecords: [],
        },
      ],
    };

    const result = parseSingleWorkScheduleResult(data, "2022-11-23");

    expect(result).toEqual({
      flexId: "k1EBdBYm0y",
      timeslots: [
        {
          type: FlexTimeSlotType.OFFICE_WORK,
          start: "10:30",
          end: "13:00",
        },
        {
          type: FlexTimeSlotType.TIME_OFF,
          start: "13:00",
          end: "19:30",
        },
      ],
      workStarts: [],
    });
  });
});
