import * as https from "https";
import { PixivDetails, PixivTag, SuggestedImages } from "@client/utils/types";
import fetch from "node-fetch";

interface PixivImageTags {
  tag: string;
  locked: boolean;
  deletable: boolean;
  userId: string;
  userName: string;
}

interface IllustrationDetails {
  illustId: string;
  illustTitle: string;
  illustComment: string;
  id: string;
  title: string;
  description: string;
  createDate: string;
  uploadDate: string;
  aiType: number;
  url: string;
  tags: {
    authorId: string;
    isLocked: boolean;
    tags: PixivImageTags[];
    writable: boolean;
  }
}

interface ExpandedIllustrationDetails extends IllustrationDetails {
  alt: string;
  userId: string;
  userName: string;
  userAccount: string;
  userIllusts: {
    [key: string]: IllustrationDetails;
  };
  width: number;
  height: number;
  pageCount: number;
  bookmarkCount: number;
  likeCount: number;
  commentCount: number;
  responseCount: number;
  viewCount: number;
  bookStyle: string;
  isOriginal: boolean;
  isBookmarkable: boolean;
  isUnlisted: boolean;
  commentOff: 0,
}

interface PixivIllustSearchData {
  id: string;
  title: string;
  illustType: number;
  url: string;
  description: string;
  tags: string[];
  userId: string;
  userName: string;
  width: number;
  height: number;
  createDate: string;
  updateDate: string;
  aiType: number;
  profileImageUrl: string;
}

interface PixivIllustSearchBody {
  illust: { data: PixivIllustSearchData[] };
}

interface PixivTagLangTranslations {
  en: string;
  romaji: string;
}

interface PixivTagTranslation {
  [key: string]: PixivTagLangTranslations;
}

interface PixivTagDetailsBody {
  tag: string;
  tagTranslation: PixivTagTranslation;
}

interface PixivTagDetails {
  body: PixivTagDetailsBody
}

interface PixivIllustSearch {
  error: boolean;
  body: PixivIllustSearchBody;
}

export interface PixivIllustDetails {
  error: boolean;
  message: string;
  body: ExpandedIllustrationDetails;
}

const getIllustrationData = async (pixivID: string): Promise<PixivIllustDetails | undefined> => {
  const response = await fetch("https://www.pixiv.net/ajax/illust/" + pixivID, {
    method: "GET",
    signal: AbortSignal.timeout(120000)
  });

  if (response.ok)
    return await response.json() as PixivIllustDetails;
};

export const getImageURL = async (baseURL: string, pixivID: string, frame: string): Promise<string> => {
  const ext = baseURL.split(".").pop();

  let imageLink = "";
  if (baseURL.includes("img-master"))
    imageLink = "https://i.pximg.net/img-original" + baseURL.split("img-master")[1].split(pixivID)[0] + pixivID + "_p" + frame + "." + ext;
  else
    imageLink = "https://i.pximg.net/img-original" + baseURL.split("custom-thumb")[1].split(pixivID)[0] + pixivID + "_p" + frame + "." + ext;

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const checkJPG = await fetch(
    imageLink,
    {
      method: "GET",
      agent,
      referrer: "https://www.pixiv.net/",
    }
  );

  if (!checkJPG.ok) {
    imageLink = imageLink.split(".jpg")[0] + ".png";
  }

  return imageLink;
};

export const getImageLink = async (pixivID: string, frame: string): Promise<PixivDetails | undefined> => {

  const res = await getIllustrationData(pixivID);
  if (res) {

    const smallImageLink = res.body.userIllusts[pixivID].url;
    const imageLink = await getImageURL(smallImageLink, pixivID, frame);
    const artist = res.body.userName;
    const artistID = res.body.userId;
    const artistLink = "https://www.pixiv.net/member.php?id=" + artistID;
    const pixivLink = "https://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + pixivID;
    const description = res.body.description;
    const title = res.body.title;
    const bookmarkCount = res.body.bookmarkCount;
    const likeCount = res.body.likeCount;
    const tags = res.body.tags.tags.map(tag => tag.tag);

    return {
      title,
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
  const response = await fetch("https://www.pixiv.net/ajax/search/tags/" + tagName, {
    method: "GET",
    headers: { "accept-language": "en-US" }
  });

  if (response.ok) {
    const res = await response.json() as PixivTagDetails;
    const translationEN = Object.values(res.body.tagTranslation)[0]?.en;
    const translationRomaji = Object.values(res.body.tagTranslation)[0]?.romaji;
    const pixivTag: PixivTag = {
      jpName: res.body.tag,
      enName: translationEN ? translationEN : translationRomaji ? translationRomaji : res.body.tag,
      link: "https://www.pixiv.net/tags/" + res.body.tag
    };

    return pixivTag;
  }
};

export const getPixivIllustrations = async (tagName: string, page: string, slice: number, count: number, token: string): Promise<SuggestedImages | undefined> => {
  // change mode for R18, all, or all ages
  const searchURL = "https://www.pixiv.net/ajax/search/illustrations/" + tagName + "?order=date_d&mode=safe&p=" + page + "&s_mode=s_tag_full&lang=en&version=82d3db204a8e8b7e2f627b893751c3cc6ef300fb";

  const response = await fetch(searchURL, {
    method: "GET",
    headers: { "accept-language": "en-US", cookie: `PHPSESSID=${token}`, "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36" },

  });


  if (response.ok) {
    const res = await response.json() as PixivIllustSearch;
    const illusts: PixivDetails[] = [];

    const promises = await Promise.all(res.body.illust.data.map(async illustration => { if (illustration.aiType !== 2) return getImageLink(illustration.id, "0"); }));

    promises.forEach(promise => { if (promise) illusts.push(promise); });

    const suggestedImages = illusts.sort((a, b) => b.likeCount - a.likeCount).slice(0, 29);
    return { suggestedImages };
  }
};