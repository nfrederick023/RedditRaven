
import { PixivDetails, PixivTag, SuggestedImages } from "@client/utils/types";
import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from "axios";

import * as http from "http";
import * as https from "https";

import { getCredentials, getImageDatabase, setImageDatabase } from "@server/utils/config";
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

const getIllustrationData = async (pixivID: string, headers?: RawAxiosRequestHeaders | AxiosHeaders): Promise<PixivIllustDetails | undefined> => {

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

export const getImageLink = async (pixivID: string, frame: string, headers?: RawAxiosRequestHeaders | AxiosHeaders): Promise<PixivDetails | undefined> => {

  const res = await getIllustrationData(pixivID, headers);

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
  const searchURL = "https://www.pixiv.net/ajax/search/illustrations/" + tagName + "?order=date_d&mode=safe&p=" + (page + 1) + "&s_mode=s_tag_full&ai_type=1";
  const headers = await getHeader();
  const imageDatabase = await getImageDatabase();

  if (headers) {
    const params: AxiosRequestConfig = {
      method: "GET",
      headers
    };

    try {
      const response = await axios<PixivIllustSearch>(searchURL, params);
      const illustrations = response.data.body.illust.data;

      if (response.status === 200 && illustrations) {
        const suggestedImages: PixivDetails[] = [];

        for (const illust of illustrations) {
          const matchingImage = imageDatabase.find(image => image.pixivID === illust.id);
          if (matchingImage && matchingImage.imageBlob) {
            suggestedImages.push(matchingImage);
          } else {
            const newImage = await getImageLink(illust.id, "0", headers);

            if (newImage) {
              const res = await loadImage(newImage.mediumImageLink);
              if (res) {
                newImage.imageBlob = Buffer.from(res.data).toString("base64");
                suggestedImages.push(newImage);
                imageDatabase.push(newImage);

                // try to prevent rate limiting
                await new Promise<void>((res) => {
                  setTimeout(() => {
                    res();
                  }, 1000);
                });
              }
            }
          }
        }

        setImageDatabase(imageDatabase);

        return { suggestedImages: suggestedImages.sort((a, b) => b.likeCount - a.likeCount) };
      }
    } catch (e) {
      return undefined;
    }

  }

  return undefined;
};

const getHeader = async (): Promise<RawAxiosRequestHeaders | AxiosHeaders | undefined> => {
  const token = getCredentials().PIXIV_TOKEN;
  const header: RawAxiosRequestHeaders | AxiosHeaders = { "accept-language": "en-US", cookie: `PHPSESSID=${token}; `, "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36" };

  // I'm getting an error sometimes when I don't have certain headers (namely cfuvid). I don't know what that is, but this is a way to get that header. 
  try {
    await axios<PixivIllustSearch>("https://www.pixiv.net/ajax/street/access", { method: "GET", headers: header });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      e.response?.headers["set-cookie"]?.forEach(rawCookie => {
        const cookie = rawCookie.split("path=/;")?.[0].trim();
        header.cookie = header.cookie + cookie + " ";
      });
    }

    return header;
  }

  return undefined;
};
