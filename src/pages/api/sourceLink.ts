import { NextApiRequest, NextApiResponse } from "next";
import { checkHashedPassword } from "@server/utils/auth";
import { getImageLink, loadImage } from "@server/api/getPixivDetails";

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

  if (!link.includes("https://www.pixiv.net/") && !link.includes("/artworks/")) {
    res.status(400).json({ message: "Link format is incorrect." });
    return;
  }

  let pixivID: string = link.split("/artworks/")[1];
  let frame = "0";

  if (pixivID.includes("#")) {
    frame = pixivID.split("#").pop() ?? "0";
    pixivID = pixivID.split("#")[0];
  }

  const pixivDetails = await getImageLink(pixivID, frame);
  if (pixivDetails) {
    const loadedImage = await loadImage(pixivDetails.mediumImageLink);
    if (loadedImage)
      pixivDetails.imageBlob = Buffer.from(loadedImage.data).toString("base64");
  }
  res.status(200).send(pixivDetails);
  return;
};

export default sourceLink;