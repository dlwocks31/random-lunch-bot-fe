import { chunk } from "lodash";
import { determineTimeslotOfTime } from "./DetermineTimeslotOfTime";
import { FlexApiService } from "./FlexApiService";
import { FlexTimeSlot } from "./FlexTimeSlot";
import { FlexTimeSlotType } from "./FlexTimeSlotType";
import { FlexUser } from "./FlexUser";

export class FlexService {
  constructor(private readonly flexApiService: FlexApiService) {}

  async getUserByWorkingStatus(
    date: string,
    time: string,
  ): Promise<{
    officeWork: FlexUser[];
    remoteWork: FlexUser[];
    timeOff: FlexUser[];
  }> {
    const departmentIds = await this.flexApiService.getDepartmentIds();
    const simpleUsers = await this.flexApiService.searchSimpleUsers(
      departmentIds,
    );
    const flexUsers: FlexUser[] = await Promise.all(
      simpleUsers.map(async (u) => ({
        ...u,
        email: (await this.flexApiService.getUserPersonals(u.flexId)).email,
      })),
    );
    const workSchedules: {
      flexId: string;
      timeslots: FlexTimeSlot[];
    }[] = [];
    for (const userChunk of chunk(flexUsers, 20)) {
      workSchedules.push(
        ...(await this.flexApiService.getWorkSchedules(
          userChunk.map((a) => a.flexId),
          date,
        )),
      );
    }
    const officeWork: FlexUser[] = [];
    const remoteWork: FlexUser[] = [];
    const timeOff: FlexUser[] = [];
    for (const schedule of workSchedules) {
      const flexUser = flexUsers.find((u) => u.flexId === schedule.flexId);
      if (!flexUser) continue;
      const timeslotOfTarget = determineTimeslotOfTime(
        schedule.timeslots,
        time,
      );
      if (timeslotOfTarget === FlexTimeSlotType.TIME_OFF) {
        timeOff.push(flexUser);
      } else if (timeslotOfTarget === FlexTimeSlotType.REMOTE_WORK) {
        remoteWork.push(flexUser);
      } else {
        officeWork.push(flexUser);
      }
    }
    return {
      officeWork,
      remoteWork,
      timeOff,
    };
  }
}
