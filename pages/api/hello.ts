// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { FlexService } from "../../utils/flex/FlexService";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<string[]>,
) {
  const flexService = new FlexService(process.env.FLEX_AID || "");
  flexService
    .getDepartmentIds()
    .then((departmentIds) => res.status(200).json(departmentIds));
}
