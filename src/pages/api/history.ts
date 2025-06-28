import { NextApiRequest, NextApiResponse } from "next";
import { checkHashedPassword } from "@server/utils/auth";
import { getHistory } from "@server/utils/config";

const history = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  if (!(checkHashedPassword(req.cookies.authToken ?? ""))) {
    res.statusCode = 401;
    res.end(JSON.stringify("Unauthorized"));
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  res.status(200).send(getHistory());
  return;
};

export default history;