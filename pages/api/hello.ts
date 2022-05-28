// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { FlexApiService } from "../../utils/flex/FlexApiService";
import { FlexService } from "../../utils/flex/FlexService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    const flexService = new FlexService(
      new FlexApiService(process.env.FLEX_AID || ""),
    );
    const result = await flexService.getUserByWorkingStatus(
      "2022-05-26",
      "13:00",
    );
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
