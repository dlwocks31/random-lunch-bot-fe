import axios from "axios";
import { DateTime } from "luxon";
import { FlexTimeSlotType } from "./FlexTimeSlotType";

// Flex API 각각에 대해, 처리하기 쉽도록 얇게 래핑하는 것을 목표로 한다. 복잡한 비즈니스 로직 / 여러개의 API를 엮어서 처리해아 하는 로직은 여기서 수행하지 않는다.
// 유닛 테스트 단계에서는 이 클래스를 mocking하여도 핵심 비즈니스 로직을 테스트할 수 있는 것을 목표로 한다.
// ex. 각 유저에 대해 어떤 종류의 타임슬롯이 어느 기간에 설정되어 있는지 가져온다. 하지만 특정 날짜에 대해 재택 유저가 누가 있는지는 여기서 추출하지 않는다.
export class FlexApiService {
  private readonly MOMSITTER_ID_HASH = "bqzoep28a4";
  constructor(private flexAid: string) {}

  async getDepartmentIds(): Promise<string[]> {
    const parseDepartmentRecursive = (data: any): string[] => {
      // return if data is not array
      if (!Array.isArray(data)) {
        return [];
      }
      const result: string[] = [];
      for (const item of data) {
        const department = item.department;
        if (typeof department?.idHash === "string") {
          result.push(department.idHash);
        }
        if (Array.isArray(item.children)) {
          result.push(...parseDepartmentRecursive(item.children));
        }
      }
      return result;
    };
    const response = await axios.post(
      "https://flex.team/action/v2/core/departments/search/tree",
      {
        customerIdHashes: [this.MOMSITTER_ID_HASH],
        visible: true,
      },
      {
        headers: {
          "x-flex-aid": this.flexAid,
        },
      },
    );
    return parseDepartmentRecursive(response.data);
  }

  private static USER_STATUS = [
    "LEAVE_OF_ABSENCE",
    "LEAVE_OF_ABSENCE_SCHEDULED",
    "RESIGNATION_SCHEDULED",
    "IN_APPRENTICESHIP",
    "IN_EMPLOY",
  ];
  async searchSimpleUsers(
    departmentIds: string[],
  ): Promise<{ flexId: string; departments: string[]; name: string }[]> {
    const result: { flexId: string; name: string; departments: string[] }[] =
      [];
    var continuationToken: string | undefined = undefined;
    while (true) {
      var url =
        "https://flex.team/action/v2/search/customers/bqzoep28a4/search-simple-users?size=50";
      if (continuationToken) {
        url += `&continuationToken=${encodeURIComponent(continuationToken)}`;
      }
      const response = await axios.post(
        url,
        {
          filter: {
            departmentIdHashes: departmentIds,
            userStatuses: FlexApiService.USER_STATUS,
          },
        },
        {
          headers: {
            "x-flex-aid": this.flexAid,
          },
        },
      );
      for (const { user, departments } of response.data.list) {
        result.push({
          flexId: user.userIdHash,
          departments: departments.map((d: any) => d.name),
          name: user.name,
        });
      }
      if (!response.data.hasNext) break;
      continuationToken = response.data.continuation;
    }
    return result;
  }

  async getUserPersonals(flexId: string): Promise<{ email: string }> {
    const response = await axios.get(
      `https://flex.team/api/v2/core/user-personals/${flexId}`,
      {
        headers: {
          "x-flex-aid": this.flexAid,
        },
      },
    );
    return { email: response.data.email };
  }

  async getWorkSchedules(
    flexIds: string[],
    date: string,
  ): Promise<
    {
      flexId: string;
      timeslots: { type: FlexTimeSlotType; start: string; end: string }[];
    }[]
  > {
    const timeStampFrom = Date.parse(date) - 9 * 60 * 60 * 1000; // 9 hours before
    const timeStampTo = timeStampFrom;

    const response = await axios.get(
      `https://flex.team/api/v2/time-tracking/users/work-schedules?timeStampFrom=${timeStampFrom}&timeStampTo=${timeStampTo}&` +
        flexIds.map((id) => `userIdHashes=${id}`).join("&"),
      {
        headers: {
          "x-flex-aid": this.flexAid,
        },
      },
    );
    return response.data.workScheduleResults
      .map((item: any) => {
        const workFormIdToTypeMap: Map<string, string> = new Map();
        for (const form of item.workFormSummary.workFormResults) {
          workFormIdToTypeMap.set(form.customerWorkFormId, form.name);
        }
        const desiredDayRecords = item.days.find((a: any) => a.date === date);
        const { workRecords, timeOffs } = desiredDayRecords;

        const workRecordTimeSlots: {
          type: string;
          start: string;
          end: string;
        }[] = workRecords
          .map((record: any) => {
            const rawType = workFormIdToTypeMap.get(record.customerWorkFormId);
            const type =
              rawType === "재택근무"
                ? FlexTimeSlotType.REMOTE_WORK
                : rawType === "근무"
                ? FlexTimeSlotType.OFFICE_WORK
                : undefined;
            if (!type) return null;
            return {
              type,
              start: DateTime.fromMillis(record.blockTimeFrom.timeStamp)
                .setZone("Asia/Seoul")
                .toFormat("HH:mm"),
              end: DateTime.fromMillis(record.blockTimeTo.timeStamp)
                .setZone("Asia/Seoul")
                .toFormat("HH:mm"),
            };
          })
          .filter((a: any) => !!a);
        const timeOffTimeSlots: {
          type: string;
          start: string;
          end: string;
        }[] = timeOffs.map((timeOff: any) => ({
          type: FlexTimeSlotType.TIME_OFF,
          start: DateTime.fromMillis(timeOff.blockTimeFrom.timeStamp)
            .setZone("Asia/Seoul")
            .toFormat("HH:mm"),
          end: DateTime.fromMillis(timeOff.blockTimeTo.timeStamp)
            .setZone("Asia/Seoul")
            .toFormat("HH:mm"),
        }));
        return {
          flexId: item.userIdHash,
          timeslots: workRecordTimeSlots.concat(timeOffTimeSlots),
        };
      })
      .filter((a: any) => !!a);
  }
}
