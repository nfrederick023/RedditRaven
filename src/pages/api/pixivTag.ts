import { NextApiRequest, NextApiResponse } from "next";
import { checkHashedPassword } from "@server/utils/auth";
import { getPixivTag } from "@server/api/getPixivDetails";

const getPivixTagAPI = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

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

  if (!link.includes("https://www.pixiv.net/") && !link.includes("/tags/")) {
    res.status(400).json({ message: "Link format is incorrect." });
    return;
  }

  const tagName = link.split("/tags/")[1].split("/")[0];

  const pixivTagDetails = await getPixivTag(tagName);

  if (pixivTagDetails)
    res.status(200).send(pixivTagDetails);
  else
    res.status(500).json({ message: "Unable to retrieve pixiv tag." });
  return;
};

export default getPivixTagAPI;