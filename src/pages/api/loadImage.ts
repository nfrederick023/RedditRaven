import * as https from "https";
import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
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

  if (!link.includes("https://i.pximg.net/img-original/img/")) {
    res.status(400).json({ message: "Link format is incorrect." });
    return;
  }

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const responseJPG = await fetch(
    link,
    {
      method: "GET",
      agent,
      referrer: "https://www.pixiv.net/",
    }
  );

  if (responseJPG.ok) {
    const contentType = responseJPG.headers.get("content-type") ?? "";
    res.setHeader("Content-Type", contentType);
    responseJPG.body?.pipe(res);
    return;
  }

  const convertedPNGLink = link.split(".jpg")[0] + ".png";
  const responsePNG = await fetch(
    convertedPNGLink,
    {
      method: "GET",
      agent,
      referrer: "https://www.pixiv.net/",
    }
  );

  if (responsePNG.ok) {
    const contentType = responsePNG.headers.get("content-type") ?? "";
    res.setHeader("Content-Type", contentType);
    responsePNG.body?.pipe(res);
    return;
  }

  res.status(500).json({ message: "Could not find an image. Error code from Pixiv: " + responsePNG.status });
};

export default sourceLink;