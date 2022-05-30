import type { NextApiRequest, NextApiResponse } from "next";
import { FlexApiService } from "../../utils/flex/FlexApiService";
import { FlexService } from "../../utils/flex/FlexService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const flexAid: string = req.query.flexAid as string;
  const date: string = req.query.date as string;
  try {
    const flexService = new FlexService(new FlexApiService(flexAid));
    const result = await flexService.getUserByWorkingStatus(date, "13:00");
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
