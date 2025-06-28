import { NextApiRequest, NextApiResponse } from "next";
import { checkHashedPassword } from "@server/utils/auth";
import { getImage } from "@server/api/getPixivDetails";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  if (!(checkHashedPassword(req.cookies.authToken ?? ""))) {
    res.statusCode = 401;
    res.end(JSON.stringify("Unauthorized"));
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const id = req.query.id;

  if (!id) {
    res.status(400).json({ message: "No link provided." });
    return;
  }

  try {

    if (typeof id === "string") {
      const response = await getImage(id);
      if (response) {
        res.json(response);
        return;
      }
    }
  } catch (e) {
    //
  }

  res.status(500).json({ message: "Could not find an image." });
  return;
};
