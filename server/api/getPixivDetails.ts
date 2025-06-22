
import { PixivDetails, PixivTag, SuggestedImages } from "@client/utils/types";
import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from "axios";

import * as http from "http";
import * as https from "https";

import { getCredentials } from "@server/utils/config";
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
  const headers = await getHeader();


  if (!pixivID || !headers) {
    return undefined;
  }

  try {
    const response = await axios("https://www.pixiv.net/ajax/illust/" + pixivID, {
      method: "GET",
      headers
    });

    if (response.status === 200)
      return response.data as PixivIllustDetails;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Failed to get images: " + pixivID);
    return undefined;
  }
};

export const loadImage = async (url: string): Promise<AxiosResponse | undefined> => {

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

  try {
    return await axios.get(
      url.split(".jpg")[0] + ".png",
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
};

export const getImageLink = async (pixivID: string, frame: string): Promise<PixivDetails | undefined> => {

  const res = await getIllustrationData(pixivID);

  if (res) {
    let smallImageLink = res.body.userIllusts[pixivID].url;

    if (smallImageLink.includes("_p0")) {
      smallImageLink = smallImageLink.split("_p0")[0] + "_p" + frame + smallImageLink.split("_p0")[1];
    }

    const text = smallImageLink.split(pixivID)[1]?.split("_");

    if (!text) {
      return undefined;
    }

    text.pop();
    let mediumImageLink = "https://i.pximg.net/c/540x540_70/img-master/img/" + smallImageLink.split("/img/")[1].split(pixivID)[0] + pixivID + text.join("_") + "_master1200" + ".jpg";

    if (mediumImageLink.includes("_p0")) {
      mediumImageLink = mediumImageLink.split("_p0")[0] + "_p" + frame + mediumImageLink.split("_p0")[1];
    }

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
        mediumImageLink,
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

export const getPixivIllustrations = async (tagName: string, page: number, slice: number, count: number): Promise<SuggestedImages | undefined> => {
  // change mode for R18, all, or all ages
  const searchURL = "https://www.pixiv.net/ajax/search/illustrations/" + tagName + "?order=date_d&mode=safe&p=" + (page + 1) + "&s_mode=s_tag_full";
  const headers = await getHeader();

  if (headers) {
    const params: AxiosRequestConfig = {
      method: "GET",
      headers
    };

    try {
      const response = await axios<PixivIllustSearch>(searchURL, params);
      if (response.status === 200 && response.data.body.illust.data) {
        const unfilteredIllustations = await Promise.all(response.data.body.illust.data.map(async illustration => { if (illustration.aiType !== 2) return getImageLink(illustration.id, "0"); }));
        const illusts: PixivDetails[] = unfilteredIllustations.filter((promise) => promise) as PixivDetails[];
        const suggestedImages = await Promise.all(illusts.sort((a, b) => b.likeCount - a.likeCount).slice(0, 40).map(async image => {
          const res = await loadImage(image.mediumImageLink);
          if (res) {
            image.imageBlob = Buffer.from(res.data).toString("base64");
          }
          return image;
        }));

        return { suggestedImages };
      }
    } catch (e) {
      return undefined;
    }

  }

  return undefined;
};

const getHeader = async (): Promise<RawAxiosRequestHeaders | AxiosHeaders | undefined> => {
  const token = getCredentials().PIXIV_TOKEN;
  const header: RawAxiosRequestHeaders | AxiosHeaders = { "accept-language": "en-US", cookie: `PHPSESSID=${token}; `, "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36" };

  try {
    await axios<PixivIllustSearch>("https://www.pixiv.net/ajax/street/access", { method: "GET", headers: header });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      e.response?.headers["set-cookie"]?.forEach(rawCookie => {
        const cookie = rawCookie.split("path=/;")?.[0].trim();
        header.cookie = header.cookie + cookie + " ";
      });
    }

    console.log(header);
    return header;
  }

  return undefined;
};
