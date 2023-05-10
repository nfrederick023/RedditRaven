import * as https from "https";
import { PixivDetails } from "@client/types/types";
import fetch from "node-fetch";

interface PixivImageTags {
  authorId: string;
  isLocked: boolean;
  tags: PixivTag[];
}

interface PixivTag {
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
  url: never;
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

export interface PixivIllustDetails {
  error: boolean;
  message: string;
  body: ExpandedIllustrationDetails;
}

export const getImageLink = async (pixivID: string, frame: string): Promise<PixivDetails> => {
  const response = await fetch("https://www.pixiv.net/ajax/illust/" + pixivID, {
    method: "GET",
  });


  if (response.ok) {
    const res = await response.json() as PixivIllustDetails;
    const masterUrl: string = res.body.userIllusts[pixivID].url;
    const ext = res.body.userIllusts[pixivID].url.split(".").pop();

    let imageLink = "";

    if (masterUrl.includes("img-master"))
      imageLink = "https://i.pximg.net/img-original" + masterUrl.split("img-master")[1].split(pixivID)[0] + pixivID + "_p" + frame + "." + ext;
    else
      imageLink = "https://i.pximg.net/img-original" + masterUrl.split("custom-thumb")[1].split(pixivID)[0] + pixivID + "_p" + frame + "." + ext;

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

    const artist = res.body.userName;
    const artistID = res.body.userId;
    const artistLink = "https://www.pixiv.net/member.php?id=" + artistID;
    const pixivLink = "https://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + pixivID;
    const description = res.body.description;
    const title = res.body.title;

    return {
      title,
      artist,
      artistID,
      artistLink,
      pixivID,
      pixivLink,
      imageLink,
      description,
    };
  }

  return {};
};
