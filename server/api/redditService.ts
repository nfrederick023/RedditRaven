import { CommentRequest, ResubmitResponse, SubmitRequest, SubmitResponse, SubredditAbout, SubredditFlair } from "@client/utils/types";
import { getCredentials } from "@server/utils/config";
import { loadImage } from "./getPixivDetails";
import FormData from "form-data";
import WebSocket from "websocket";
import axios from "axios";

interface SubredditAboutRaw {
  readonly data: {
    readonly display_name: string;
    readonly allow_videogifs: boolean;
    readonly allow_videos: boolean;
    readonly is_crosspostable_subreddit: boolean;
    readonly over18: boolean;
    readonly url: string;
  }
}

interface SubredditFlairRaw {
  readonly text: string;
  readonly text_editable: boolean;
  readonly id: string;
}

interface UploadRequest {
  filepath: string;
  mimetype: string;
}

type FieldName = "key" | "x-amz-algorithm" | "x-amz-date" | "x-amz-storage-class" | "success_action_status" | "bucket" | "acl" | "x-amz-signature" | "x-amz-security-token" | "x-amz-meta-ext" | "policy" | "x-amz-credential" | "Content-Type";

interface UploadResponseField {
  name: FieldName;
  value: string;
}

interface UploadResponse {
  args: {
    action: string,
    fields: UploadResponseField[]
  },
  asset: {
    asset_id: string;
    processing_state: string;
    payload: { filepath: string; },
    websocket_url: string;
  }
}

interface PostUploadedImageWSMessage {
  type: string,
  utf8Data: string;
}

interface ParsedUTF8Data {
  type: string;
  payload: {
    redirect: string;
  }
}

interface AccessTokenRes {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

const redditBaseURL = "https://oauth.reddit.com";
let userAgent: string | undefined;

const getAccessToken = async (): Promise<string> => {
  const creds = getCredentials();
  const auth = "Basic " + Buffer.from(creds.CLIENT_ID + ":" + creds.CLIENT_SECRET).toString("base64");
  userAgent = `linux:RdditRaven:v1.0.1 (by /u/${creds.REDDIT_USERNAME})`;

  const accessTokenRes = await axios.post<AccessTokenRes>("https://www.reddit.com/api/v1/access_token", new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: creds.REFRESH_TOKEN
  }), {
    headers: { Authorization: auth }
  });
  return accessTokenRes.data.access_token;
};

const getReddit = async <T>(url: string): Promise<T> => {
  const token = await getAccessToken();
  return (await axios.get<T>(redditBaseURL + url, { headers: { Authorization: "bearer " + token, "User-Agent": userAgent } })).data;
};

const postReddit = async <T, D>(url: string, req: D): Promise<T> => {
  const token = await getAccessToken();
  const formData = new FormData();
  for (const key in req) {
    if (typeof req[key] !== "undefined") {
      if (typeof req[key] === "boolean") {
        if (req[key]) {
          formData.append(key, "true");
        } else {
          formData.append(key, "false");
        }
      } else {
        formData.append(key, req[key]);
      }
    }
  }
  const res = await axios.post<T>(redditBaseURL + url, formData, { headers: { Authorization: "bearer " + token, "User-Agent": userAgent } });
  return res.data;
};


/**
 * Retrieves the about.JSON for a subreddit
 * @param subredditName the name of the subreddit 
 * @returns a lite version of the about.JSON data
 */
export const getSubbredditAbout = async (subredditName: string): Promise<SubredditAbout> => {
  const aboutRaw = await getReddit<SubredditAboutRaw>(`/r/${subredditName}/about.json`);
  return {
    url: aboutRaw.data.url,
    isCrosspostable: aboutRaw.data.is_crosspostable_subreddit,
    isNSFW: aboutRaw.data.over18
  };
};

/**
 * Gets an array of posts flairs for a subreddit.
 * @param subredditName the name of the subreddit 
 * @returns the array of post flairs
 */
export const getFlairsBySubbreddit = async (subredditName: string): Promise<SubredditFlair[]> => {
  try {
    return (await getReddit<SubredditFlairRaw[]>(`/r/${subredditName}/api/link_flair`))
      .map((flairRaw): SubredditFlair => {
        return {
          name: flairRaw.text,
          isTextEditable: flairRaw.text_editable,
          id: flairRaw.id
        };
      });
  } catch (e) {
    // api returns 403 if flairs are not enabled, so return empty array if error
    return [];
  }
};
export const submitImagePost = async (postRequest: SubmitRequest): Promise<string> => {
  if (postRequest.url) {
    const imageResponse = await loadImage(postRequest.url);

    // await new Promise(resolve => setTimeout(resolve, 15000));

    const mimetype = imageResponse?.headers["content-type"] as string ?? "";
    const filepath = postRequest.url.split("/").pop() || "";

    const uploadImageRequest = {
      filepath,
      mimetype
    };

    const uploadLease = await postReddit<UploadResponse, UploadRequest>("/api/media/asset.json", uploadImageRequest);

    const uploadURL = "https:" + uploadLease.args.action;
    const formdata = new FormData();

    const getItemByName = (name: FieldName): UploadResponseField | undefined => {
      return uploadLease.args.fields.find(item => item.name === name) ?? undefined;
    };
    const items: FieldName[] = ["acl", "Content-Type", "key", "policy", "success_action_status", "x-amz-algorithm", "x-amz-credential", "x-amz-date", "x-amz-security-token", "x-amz-signature", "x-amz-storage-class", "x-amz-meta-ext", "bucket"];
    //const items: FieldName[] = ["key", "x-amz-algorithm", "x-amz-date", "x-amz-storage-class", "success_action_status", "bucket", "acl", "x-amz-signature", "x-amz-security-token", "x-amz-meta-ext", "policy", "x-amz-credential", "Content-Type"];

    const allLeaseItems: UploadResponseField[] = [];

    for (const item of items) {
      const leaseItem = getItemByName(item);
      if (leaseItem) {
        allLeaseItems.push(leaseItem);
      }
    }

    const imageData = Buffer.from(imageResponse?.data);

    //const buffer = Buffer.from(await (blob).arrayBuffer());
    allLeaseItems.forEach(item => formdata.append(item.name, item.value));
    formdata.append("file", imageData);

    // FUCK NODE FETCH!!
    // FUCK NODE FETCH!!
    // FUCK NODE FETCH!!
    // FUCK NODE FETCH!!
    // FUCK NODE FETCH!!
    // FUCK NODE FETCH!!

    // I WASTED 15 HOURS ON THIS STUPID SHIT

    // FUCK YOU NODE FETCH!!!!!!!!!!!!
    await axios({
      method: "POST",
      url: uploadURL,
      data: formdata,
      headers: formdata.getHeaders(),
    });

    const WebSocketClient = new WebSocket.client;
    const uploadedImageLink = uploadURL + "/" + getItemByName("key")?.value;

    postRequest.url = uploadedImageLink;
    const res = await postReddit<ResubmitResponse, SubmitRequest>("/api/submit", postRequest);
    const websocket_url = res.json.data.websocket_url;

    // the websocket url returned from uploadResponse will give us the post thing_id after we post the image to reddit
    WebSocketClient.connect(websocket_url);

    const getConnection = (): Promise<WebSocket.connection> => {
      return new Promise(function (resolve,) {
        WebSocketClient.on("connect", connection => {
          resolve(connection);
        });
      });
    };

    const connection = await getConnection();

    const getURL = (connection: WebSocket.connection): Promise<string> => {
      return new Promise(function (resolve, reject) {
        connection.on("message", (message) => {
          const msg = message as PostUploadedImageWSMessage;
          const parsedUTF8Data = JSON.parse(msg.utf8Data) as ParsedUTF8Data;
          connection.close();
          resolve(parsedUTF8Data.payload.redirect);
        });
        connection.on("error", err => {
          reject(err);
        });
      });
    };

    // // post the image to reddit, this will turn our uploaded image into an i.reddit upload, which is publicly accessible
    // await redditClient().post<SubmitResponse, SubmitRequest>("/api/submit", postRequest);

    // get the post link from the websocket
    const postLink = await getURL(connection);

    // parse the thing_id out from the post link, and return the thing_id to be used for making comments 
    const thing_id = "t3_" + postLink.split("comments/")[1].split("/")[0];
    return thing_id;
  }

  return "";
};

export const submitComment = async (commentReqeust: CommentRequest): Promise<SubmitResponse> => {
  return await postReddit<SubmitResponse, CommentRequest>("/api/comment", commentReqeust);
};

export const submitPost = async (submitRequest: SubmitRequest): Promise<SubmitResponse> => {
  return await postReddit<SubmitResponse, SubmitRequest>("/api/submit", submitRequest);
};