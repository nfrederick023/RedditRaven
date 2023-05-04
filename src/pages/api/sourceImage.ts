import { NextApiRequest, NextApiResponse } from "next";
import { getPixivDetails } from "@server/api/getPixivDetails";
import PersistentFile from "formidable/PersistentFile";
import SauceNAO from "saucenao";
import formidable from "formidable";
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
    creator: string;
    material: string;
    characters: string;
    source: string;
    pixiv_id?: string;
  }
}

interface Sauce {
  results: SauceResult[];
}


const sourceImage = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) throw err;
    const filePath = (files.file as unknown as any).filepath;
    const buffer = fs.readFileSync(filePath);

    const apiKey = "93f82d5c46a57a853bbd1bded461747abd71de7b";
    const mySauce = new SauceNAO(apiKey);
    const sauceMatches = (await mySauce(buffer)).json as Sauce;

    const sortedResults = sauceMatches.results.sort((a, b) => Number(b.header.similarity) - Number(a.header.similarity));
    const sauce = sortedResults.find(result => result.data.pixiv_id);

    if (sauce && sauce.data.pixiv_id) {
      const frame = sauce.header.index_name.split(sauce.data.pixiv_id + "_p")[1].slice(0, 1);
      await getPixivDetails(sauce.data.pixiv_id, frame);
      res.status(200).send("Success!");
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