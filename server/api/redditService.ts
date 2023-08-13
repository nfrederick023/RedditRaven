
import { CommentRequest, SubmitRequest, SubmitResponse, SubredditAbout, SubredditFlair } from "@client/utils/types";
import { creds } from "@server/credentials/creds";
import { default as nodeFetch } from "node-fetch";
import FormData from "form-data";
import Reddit from "reddit";
import WebSocket from "websocket";
import https from "https";
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

interface UploadResponseFields {
  name: string;
  value: string;
}

interface UploadResponse {
  args: {
    action: string,
    fields: UploadResponseFields[]
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

/**
 * Reddit API Credentials 
 */
const reddit: Reddit = new Reddit({
  username: creds.REDDIT_USERNAME,
  password: creds.PASSWORD,
  appId: creds.APP_ID,
  appSecret: creds.APP_SECRET
});

/**
 * Retrieves the about.JSON for a subreddit
 * @param subredditName the name of the subreddit 
 * @returns a lite version of the about.JSON data
 */
export const getSubbredditAbout = async (subredditName: string): Promise<SubredditAbout> => {
  const aboutRaw = (await reddit.get<SubredditAboutRaw>(`/r/${subredditName}/about.json`)).data;
  return {
    url: aboutRaw.url,
    isCrosspostable: aboutRaw.is_crosspostable_subreddit,
    isNSFW: aboutRaw.over18
  };
};

/**
 * Gets an array of posts flairs for a subreddit.
 * @param subredditName the name of the subreddit 
 * @returns the array of post flairs
 */
export const getFlairsBySubbreddit = async (subredditName: string): Promise<SubredditFlair[]> => {
  try {
    return (await reddit.get<SubredditFlairRaw[]>(`/r/${subredditName}/api/link_flair`))
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
export const submitPost = async (postRequest: SubmitRequest): Promise<string> => {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  // get the image data from pixiv
  const imageResponse = await nodeFetch(
    postRequest.url,
    {
      method: "GET",
      agent,
      referrer: "https://www.pixiv.net/",
    }
  );

  const mimetype = imageResponse.headers.get("content-type") ?? "";
  const buffer = Buffer.from(await (await imageResponse.blob()).arrayBuffer());
  const filepath = postRequest.url.split("/").pop() || "";

  // get the upload credentials for reddit
  const uploadImageRequest = {
    filepath,
    mimetype
  };
  const uploadResponse = await reddit.post<UploadResponse, UploadRequest>("/api/media/asset.json", uploadImageRequest);
  const uploadURL = "https:" + uploadResponse.args.action;
  const formdata = new FormData();

  uploadResponse.args.fields.forEach(item => formdata.append(item.name, item.value));
  formdata.append("file", buffer, filepath);

  // upload the image
  await fetch(uploadURL, {
    method: "POST",
    // ignore the error on thie line because it works and fetch is just being dumb asf
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    body: formdata,
  });

  const WebSocketClient = new WebSocket.client;
  const uploadedImageLink = uploadURL + "/" + uploadResponse.args.fields.find(item => item.name === "key")?.value;
  const websocket_url = uploadResponse.asset.websocket_url;
  // the websocket url returned from uploadResponse will give us the post thing_id after we post the image to reddit
  WebSocketClient.connect(websocket_url);
  const getURL = (): Promise<string> => {
    return new Promise(function (resolve, reject) {
      WebSocketClient.on("connect", connection => {
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
    });
  };
  postRequest.url = uploadedImageLink;

  // post the image to reddit, this will turn our uploaded image into an i.reddit upload, which is publicly accessible
  reddit.post<SubmitResponse, SubmitRequest>("/api/submit", postRequest);

  // get the post link from the websocket
  const postLink = await getURL();

  // parse the thing_id out from the post link, and return the thing_id to be used for making comments 
  const thing_id = "t3_" + postLink.split("comments/")[1].split("/")[0];
  return thing_id;
};

export const submitComment = async (commentReqeust: CommentRequest): Promise<SubmitResponse> => {
  return await reddit.post<SubmitResponse, CommentRequest>("/api/comment", commentReqeust);
};