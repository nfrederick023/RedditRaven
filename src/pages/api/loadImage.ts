import { NextApiRequest, NextApiResponse } from "next";
import { checkHashedPassword } from "@server/utils/auth";
import { loadImage } from "@server/api/getPixivDetails";

const sourceLink = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  if (!(checkHashedPassword(req.cookies.authToken ?? ""))) {
    res.statusCode = 401;
    res.end(JSON.stringify("Unauthorized"));
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const link: string | undefined = JSON.parse(req.body)?.link;

  if (!link) {
    res.status(400).json({ message: "No link provided." });
    return;
  }

  try {
    const response = await loadImage(link);
    if (response)
      res.send(Buffer.from(response.data));
    return;
  } catch (e) {
    res.status(500).json({ message: "Could not find an image." });
  }
};

export default sourceLink;