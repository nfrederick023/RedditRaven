import { NextApiRequest, NextApiResponse } from "next";
import { loadImage } from "@server/api/getPixivDetails";

const sourceLink = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const link: string | undefined = JSON.parse(req.body)?.link;

  if (!link) {
    res.status(400).json({ message: "No link provided." });
    return;
  }

  const response = await loadImage(link);

  if (response.ok) {
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
    return;
  }

  res.status(500).json({ message: "Could not find an image. Error code from Pixiv: " + response.status });
};

export default sourceLink;