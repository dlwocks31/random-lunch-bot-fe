import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
  console.log(req);
  console.log(res);
};
