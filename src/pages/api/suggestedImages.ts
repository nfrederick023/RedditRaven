import { NextApiRequest, NextApiResponse } from "next";
import { SuggestedImagesReq } from "@client/utils/types";
import { checkHashedPassword } from "@server/utils/auth";
import { getCredentials, setConfig } from "@server/utils/config";
import { getPixivIllustrations } from "@server/api/getPixivDetails";


const suggestedImages = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (!(checkHashedPassword(req.cookies.authToken ?? ""))) {
    res.statusCode = 401;
    res.end(JSON.stringify("Unauthorized"));
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const body: SuggestedImagesReq | undefined = JSON.parse(req.body) as SuggestedImagesReq;
  if (typeof body.pixivTag === "undefined") {
    res.status(400).json({ message: "No Pixiv Tag provided." });
    return;
  }

  if (typeof body.page === "undefined") {
    res.status(400).json({ message: "No Pixiv Tag provided." });
    return;
  }


  if (typeof body.slice === "undefined") {
    res.status(400).json({ message: "No Slice Provided." });
    return;
  }

  if (isNaN(Number(body.page))) {
    res.status(400).json({ message: "Page value is NaN" });
    return;
  }

  if (Number(body.page) <= 0) {
    res.status(400).json({ message: "Page value cannot be less than or equal to Zero." });
    return;
  }


  if (body.token) {
    setConfig({ ...getCredentials(), PIXIV_TOKEN: body.token });
  }

  const suggestedImages = await getPixivIllustrations(body.pixivTag.jpName, Number(body.page), body.slice, body.count);

  if (!suggestedImages) {
    res.status(500).json({ message: "Failed to get Pixiv Tag Suggested Images!" });
    return;
  }

  res.status(200).send(suggestedImages);
  return;
};

export default suggestedImages;