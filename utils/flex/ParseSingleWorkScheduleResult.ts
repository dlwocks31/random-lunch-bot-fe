import { DateTime } from "luxon";
import { P, isMatching, match } from "ts-pattern";
import { notEmpty } from "../ts/NotEmpty";
import { FlexTimeSlotType } from "./FlexTimeSlotType";

export function parseSingleWorkScheduleResult(
  data: unknown,
  date: string,
): {
  flexId: string;
  timeslots: {
    type: FlexTimeSlotType;
    start: string;
    end: string;
  }[];
  workStarts: {
    type: FlexTimeSlotType;
    start: string;
  }[];
} | null {
  const pattern = {
    userIdHash: P.string,
    days: P.array({
      date: P.string,
      workRecords: P.array({
        customerWorkFormId: P.string,
        blockTimeFrom: { timeStamp: P.number },
        blockTimeTo: { timeStamp: P.number },
      }),
      timeOffs: P.array(P.any),
      workStartRecords: P.array({
        customerWorkFormId: P.string,
        blockTimeFrom: { timeStamp: P.number },
      }),
    }),
  };
  if (!isMatching(pattern, data)) {
    console.log("data is not matching pattern");
    return null;
  }

  const workFormIdToTypeMap = new Map([
    ["1071", FlexTimeSlotType.OFFICE_WORK],
    ["1073", FlexTimeSlotType.REMOTE_WORK],
  ]);
  const desiredDayRecords = data.days.find((day) => day.date === date);
  if (!desiredDayRecords) {
    return null;
  }
  const { workRecords, timeOffs, workStartRecords } = desiredDayRecords;
  const workRecordTimeSlots: {
    type: FlexTimeSlotType;
    start: string;
    end: string;
  }[] = workRecords
    .map((record) => {
      const type = workFormIdToTypeMap.get(record.customerWorkFormId);
      if (!type) return null;
      return {
        type,
        start: timeStampToTime(record.blockTimeFrom.timeStamp),
        end: timeStampToTime(record.blockTimeTo.timeStamp),
      };
    })
    .filter(notEmpty);
  const timeOffTimeSlots: {
    type: FlexTimeSlotType;
    start: string;
    end: string;
  }[] = timeOffs
    .map((timeOff) =>
      match(timeOff)
        .with({ timeOffRegisterUnit: "DAY" }, () => ({
          type: FlexTimeSlotType.TIME_OFF,
          start: "00:00",
          end: "23:59",
        }))
        .with(
          {
            timeOffRegisterUnit: "HOUR",
            blockTimeFrom: { timeStamp: P.number },
            blockTimeTo: { timeStamp: P.number },
          },
          (timeOff) => ({
            type: FlexTimeSlotType.TIME_OFF,
            start: timeStampToTime(timeOff.blockTimeFrom.timeStamp),
            end: timeStampToTime(timeOff.blockTimeTo.timeStamp),
          }),
        )
        .otherwise(() => null),
    )
    .filter(notEmpty);

  const workStarts: { type: FlexTimeSlotType; start: string }[] =
    workStartRecords
      .map((start: any) => {
        const type = workFormIdToTypeMap.get(start.customerWorkFormId);
        if (!type) return null;
        return {
          type,
          start: timeStampToTime(start.blockTimeFrom.timeStamp),
        };
      })
      .filter(notEmpty);

  return {
    flexId: data.userIdHash,
    timeslots: [...workRecordTimeSlots, ...timeOffTimeSlots],
    workStarts,
  };
}

function timeStampToTime(timeStamp: number): string {
  return DateTime.fromMillis(timeStamp).setZone("Asia/Seoul").toFormat("HH:mm");
}
