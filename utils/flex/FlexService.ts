import axios from "axios";
import { FlexUser } from "./FlexUser";

export class FlexService {
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
  async searchSimpleUsers(departmentIds: string[]): Promise<FlexUser[]> {
    const result: FlexUser[] = [];
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
            userStatuses: FlexService.USER_STATUS,
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
          email: (await this.getUserPersonals(user.userIdHash)).email,
        });
      }
      if (!response.data.hasNext) break;
      continuationToken = response.data.continuation;
    }
    return result;
  }

  private async getUserPersonals(flexId: string): Promise<{ email: string }> {
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
      timeslots: { type: string; start: string; end: string }[];
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
        const desiredDayRecords =
          item.days.find((a: any) => a.date === date)?.workRecords || [];
        return {
          flexId: item.userIdHash,
          timeslots: desiredDayRecords
            .map((record: any) => {
              const type = workFormIdToTypeMap.get(record.customerWorkFormId);
              if (!type) return null;
              return {
                type,
                start: new Date(record.blockTimeFrom.timeStamp).toTimeString(),
                end: new Date(record.blockTimeTo.timeStamp).toTimeString(),
              };
            })
            .filter((a: any) => !!a),
        };
      })
      .filter((a: any) => !!a);
  }
}
