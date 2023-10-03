
import { PixivDetails, PixivTag, SuggestedImages } from "@client/utils/types";
import axios, { AxiosResponse } from "axios";

import * as http from "http";
import * as https from "https";

import CacheableLookup from "cacheable-lookup";

if (process.env.HAS_LOADED !== "true") {
  const cacheable = new CacheableLookup();

  cacheable.install(http.globalAgent);
  cacheable.install(https.globalAgent);
  process.env.HAS_LOADED = "true";
}

interface LimitedIllustrationDetails {
  userName: string;
  userId: string;
  description: string;
  title: string;
  bookmarkCount: number;
  likeCount: number
  tags: {
    authorId: string;
    isLocked: boolean;
    tags: {
      tag: string;
      locked: boolean;
      deletable: boolean;
      userId: string;
      userName: string;
    }[];
    writable: boolean;
  }
  userIllusts: {
    [key: string]: {
      url: string;
    }
  };
}

interface PixivTagDetails {
  body: {
    tag: string;
    tagTranslation: {
      [key: string]: {
        en: string;
        romaji: string;
      };
    };
  }
}

interface PixivIllustSearch {
  error: boolean;
  body: {
    illust: {
      data: {
        id: string;
        aiType: number;
      }[]
    }
  };
}

export interface PixivIllustDetails {
  error: boolean;
  message: string;
  body: LimitedIllustrationDetails;
}

const getIllustrationData = async (pixivID: string): Promise<PixivIllustDetails | undefined> => {
  try {
    const response = await axios("https://www.pixiv.net/ajax/illust/" + pixivID, {
      method: "GET",
    });

    if (response.status === 200)
      return response.data as PixivIllustDetails;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Failed to get images: " + pixivID);
    return undefined;
  }
};

export const loadImage = async (url: string): Promise<AxiosResponse> => {

  try {
    return await axios.get(
      url,
      {
        responseType: "arraybuffer",
        headers: {
          referer: "https://www.pixiv.net/",
        }
      }
    );
  } catch (e) {
    //
  }

  return await axios.get(
    url.split(".jpg")[0] + ".png",
    {
      responseType: "arraybuffer",
      headers: {
        referer: "https://www.pixiv.net/",
      }
    }
  );
};

export const getImageLink = async (pixivID: string, frame: string): Promise<PixivDetails | undefined> => {

  const res = await getIllustrationData(pixivID);

  if (res) {
    const smallImageLink = res.body.userIllusts[pixivID].url;
    const imageLink = "https://i.pximg.net/img-original/img/" + smallImageLink.split("/img/")[1].split("/" + pixivID)[0] + "/" + pixivID + "_p" + frame + ".jpg";
    const artist = res.body.userName;
    const artistID = res.body.userId;
    const artistLink = "https://www.pixiv.net/member.php?id=" + artistID;
    const pixivLink = "https://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + pixivID;
    const description = res.body.description;
    const title = res.body.title;
    const bookmarkCount = res.body.bookmarkCount;
    const likeCount = res.body.likeCount;
    const tags = res.body.tags.tags.map(tag => tag.tag);

    if (imageLink)
      return {
        title,
        frame,
        artist,
        artistID,
        artistLink,
        pixivID,
        pixivLink,
        imageLink,
        description,
        bookmarkCount,
        likeCount,
        smallImageLink,
        tags
      };
  }
};

export const getPixivTag = async (tagName: string): Promise<PixivTag | undefined> => {
  const response = await axios("https://www.pixiv.net/ajax/search/tags/" + tagName, {
    method: "GET",
  });

  if (response.status === 200) {
    const res = response.data as PixivTagDetails;
    const translationEN = Object.values(res.body.tagTranslation)[0]?.en;
    const translationRomaji = Object.values(res.body.tagTranslation)[0]?.romaji;
    const enName = translationEN ? translationEN : translationRomaji ? translationRomaji : res.body.tag;
    const pixivTag: PixivTag = {
      jpName: res.body.tag,
      enName: enName,
      link: "https://www.pixiv.net/tags/" + res.body.tag,
      title: enName
    };

    return pixivTag;
  }
};

export const getPixivIllustrations = async (tagName: string, page: string, slice: number, count: number, token: string): Promise<SuggestedImages | undefined> => {
  // change mode for R18, all, or all ages
  const searchURL = "https://www.pixiv.net/ajax/search/illustrations/" + tagName + "?order=date_d&mode=safe&p=" + page + "&s_mode=s_tag_full&lang=en&version=82d3db204a8e8b7e2f627b893751c3cc6ef300fb";

  const response = await axios<PixivIllustSearch>(searchURL, {
    method: "GET",
    headers: { "accept-language": "en-US", cookie: `PHPSESSID=${token}`, "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36" },
  });

  if (response.status === 200) {
    const unfilteredIllustations = await Promise.all(response.data.body.illust.data.map(async illustration => { if (illustration.aiType !== 2) return getImageLink(illustration.id, "0"); }));
    const illusts: PixivDetails[] = unfilteredIllustations.filter((promise) => promise) as PixivDetails[];
    const suggestedImages = await Promise.all(illusts.sort((a, b) => b.likeCount - a.likeCount).slice(0, 40).map(async image => {
      const res = await loadImage(image.smallImageLink);
      image.imageBlob = Buffer.from(res.data).toString("base64");
      return image;
    }));

    return { suggestedImages };
  }
};