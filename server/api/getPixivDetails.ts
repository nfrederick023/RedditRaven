
import { PixivDetails, PixivTag } from "@client/utils/types";
import { getCredentials, getImageDatabase, setImageDatabase } from "@server/utils/config";
import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from "axios";

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
      data: PixivIllustID[]
    }
  };
}

export interface PixivIllustID {
  id: string;
  aiType: number;
}

export interface PixivIllustDetails {
  error: boolean;
  message: string;
  body: LimitedIllustrationDetails;
}

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
  const headers = await getHeader();

  if (!pixivID || !headers) {
    return undefined;
  }

  try {
    const res = await axios<PixivIllustDetails>("https://www.pixiv.net/ajax/illust/" + pixivID, {
      method: "GET",
      headers
    });

    if (res.status === 200) {

      const pixivDetails = res.data.body;
      let smallImageLink = pixivDetails.userIllusts[pixivID].url;

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
      const artist = pixivDetails.userName;
      const artistID = pixivDetails.userId;
      const artistLink = "https://www.pixiv.net/member.php?id=" + artistID;
      const pixivLink = "https://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + pixivID;
      const description = pixivDetails.description;
      const title = pixivDetails.title;
      const bookmarkCount = pixivDetails.bookmarkCount;
      const likeCount = pixivDetails.likeCount;
      const tags = pixivDetails.tags.tags.map(tag => tag.tag);

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

  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Failed to get images: " + pixivID);
  }

  return undefined;

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

export const getPixivIllustrations = async (tagName: string, page: number): Promise<PixivIllustID[] | undefined> => {
  // change mode for R18, all, or all ages
  const searchURL = "https://www.pixiv.net/ajax/search/illustrations/" + tagName + "?order=date_d&mode=safe&p=" + (page + 1) + "&s_mode=s_tag_full&ai_type=1";
  const headers = await getHeader();

  if (headers) {
    const params: AxiosRequestConfig = {
      method: "GET",
      headers
    };

    try {
      const response = await axios<PixivIllustSearch>(searchURL, params);
      const illustrations = response.data.body.illust.data;

      if (response.status === 200 && illustrations) {
        return illustrations;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to retrieve list of illustrations: " + e);
    }
  }

  return undefined;
};

export const getImage = async (id: string): Promise<PixivDetails | undefined> => {
  const imageDatabase = await getImageDatabase();
  const matchingImage = imageDatabase.find(image => image.pixivID === id);
  if (matchingImage && matchingImage.imageBlob) {
    return matchingImage;
  } else {
    const newImage = await getImageLink(id, "0");
    const imageDatabase = await getImageDatabase();

    if (newImage) {
      const res = await loadImage(newImage.mediumImageLink);
      if (res) {
        newImage.imageBlob = Buffer.from(res.data).toString("base64");
        imageDatabase.push(newImage);
      }
    }

    setImageDatabase(imageDatabase);
    return newImage;
  }
};

const getHeader = async (): Promise<RawAxiosRequestHeaders | AxiosHeaders | undefined> => {
  const token = getCredentials().PIXIV_TOKEN;
  const header: RawAxiosRequestHeaders | AxiosHeaders = { "accept-language": "en-US", cookie: `PHPSESSID=${token}; `, "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36" };

  return header;
  // I'm getting an error sometimes when I don't have certain headers (namely cfuvid). I don't know what that is, but this is a way to get that header.
  // try {
  //   await axios<PixivIllustSearch>("https://www.pixiv.net/ajax/street/access", { method: "GET", headers: header });
  // } catch (e) {
  //   if (axios.isAxiosError(e)) {
  //     e.response?.headers["set-cookie"]?.forEach(rawCookie => {
  //       const cookie = rawCookie.split("path=/;")?.[0].trim();
  //       header.cookie = header.cookie + cookie + " ";
  //     });
  //   }

  //   return header;
  // }

  // return undefined;
};
