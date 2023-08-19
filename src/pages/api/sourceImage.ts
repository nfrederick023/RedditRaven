import { NextApiRequest, NextApiResponse } from "next";
import { PixivDetails } from "@client/utils/types";
import { checkHashedPassword } from "@server/utils/auth";
import { getCredentials } from "@server/utils/config";
import { getImageLink } from "@server/api/getPixivDetails";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import SauceNAO from "saucenao";
import formidable, { File } from "formidable";
import fs from "fs";

interface SauceResult {
  header: {
    similarity: string;
    thumbnail: string;
    index_id: number;
    index_name: string;
    dupes: number;
    hidden: number;
  };
  data: {
    ext_urls: string[];
    gelbooru_id: number;
    member_name?: string;
    member_id?: string;
    material: string;
    characters: string;
    pixiv_id?: string;
  }
}

interface Sauce {
  results: SauceResult[];
}

const creds = getCredentials();

const sourceImage = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  if (!(checkHashedPassword(req.cookies.authToken ?? ""))) {
    res.statusCode = 401;
    res.end(JSON.stringify("Unauthorized"));
    return;
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) throw err;
    const filePath = (files.file as File).filepath;
    const buffer = fs.readFileSync(filePath);

    const mySauce = new SauceNAO(creds.SAUCENAO_KEY);
    const sauceMatches = (await mySauce(buffer)).json as Sauce;
    const sortedResults = sauceMatches.results.sort((a, b) => Number(b.header.similarity) - Number(a.header.similarity));
    const sauce = sortedResults.find(result => result.data.pixiv_id);
    if (sauce && sauce.data.pixiv_id) {

      const pixivLink = sauce.data.ext_urls[0] || "";
      const artistID = sauce.data.member_id || "";
      const artistLink = artistID ? "https://www.pixiv.net/member.php?id=" + artistID : "";
      const pixivID = sauce.data.pixiv_id || "";
      const artist = sauce.data.member_name || "";

      if (Number(sauce.header.similarity) < 85) {
        res.status(400).send("No images were similar enough.");
        return;
      }

      const frame = sauce.header.index_name.split(sauce.data.pixiv_id)[1].split(".")[0].slice(2);
      const isNumericFrame = frame.match(/^[0-9]+$/) !== null;
      const pixivDetails = await getImageLink(pixivID, isNumericFrame ? frame : "0");

      if (pixivDetails) {
        const details: PixivDetails = {
          imageLink: pixivDetails.imageLink,
          description: pixivDetails.description,
          title: pixivDetails.title,
          artistLink,
          pixivLink,
          artistID,
          pixivID,
          artist,
          frame,
          smallImageLink: pixivDetails.smallImageLink,
          likeCount: pixivDetails.likeCount,
          bookmarkCount: pixivDetails.bookmarkCount,
          tags: pixivDetails.tags
        };

        if (details)
          res.status(200).send(details);
      }

    } else {
      res.status(400).send("The source could not be found.");
    }
  });
};

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
};

export default sourceImage;