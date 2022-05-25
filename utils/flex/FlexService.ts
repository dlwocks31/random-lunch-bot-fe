import axios from "axios";

export class FlexService {
  private readonly FLEX_AID: string = process.env.FLEX_AID || "";
  private readonly MOMSITTER_ID_HASH = "bqzoep28a4";

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
          "x-flex-aid": this.FLEX_AID,
        },
      },
    );
    return parseDepartmentRecursive(response.data);
  }

  async searchSimpleUsers(): Promise<
    { flexId: string; departments: string[]; jobRoles: string[] }[]
  > {
    return [];
  }

  async getUserPersonals(flexId: string): Promise<{ email: string }> {
    return { email: "" };
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
    return [];
  }
}
