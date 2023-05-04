import * as fs from "fs";
import * as https from "https";
import { NextApiRequest, NextApiResponse } from "next";
import { getPixivDetails } from "@server/api/getPixivDetails";
import fetch from "node-fetch";
const sourceLink = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  // const options = {
  //   key: fs.readFileSync("test/fixtures/keys/agent2-key.pem"),
  //   cert: fs.readFileSync("test/fixtures/keys/agent2-cert.pem")
  // };
  // options.agent = new https.Agent(options);

  const getImage = async (): Promise<void> => {
    const response = await fetch(
      "https://i.pximg.net/img-original/img/2013/04/23/17/57/16/35191942_p4.jpg",
      {
        method: "GET",
        agent,
        referrer: "https://www.pixiv.net/",
      }
    );

    const contentType = response.headers.get("content-type") ?? "";
    res.setHeader("Content-Type", contentType);
    response.body?.pipe(res);

  };
  return await getImage();

  // if (req.method !== "POST") {
  //   res.status(405).json({ message: "Method not allowed" });
  //   return;
  // }

  // const link: string | undefined = JSON.parse(req.body)?.link;
  // if (!link) {
  //   res.status(400).json({ message: "No link provided." });
  //   return;
  // }

  // if (!link.includes("https://www.pixiv.net/") && !link.includes("/artworks/")) {
  //   res.status(400).json({ message: "Link format is incorrect." });
  //   return;
  // }
  // let pixivID: string = link.split("/artworks/")[1];
  // let frame = "0";
  // if (pixivID.includes("#")) {
  //   frame = pixivID.split("#").pop() ?? "0";
  //   pixivID = pixivID.split("#")[0];
  // }
  // await getPixivDetails(pixivID, frame);
};

export default sourceLink;