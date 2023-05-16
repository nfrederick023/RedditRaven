
import { CommentRequest, SubmitRequest, SubmitResponse, SubredditAbout, SubredditFlair } from "@client/utils/types";
import { creds } from "@server/credentials/creds";
import Reddit from "reddit";

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
    allowsVideoGifs: aboutRaw.allow_videogifs,
    allowsVideos: aboutRaw.allow_videos,
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
export const submitPost = async (postRequest: SubmitRequest): Promise<SubmitResponse> => {
  return await reddit.post<SubmitResponse, SubmitRequest>("/api/submit", postRequest);
};

export const submitComment = async (commentReqeust: CommentRequest): Promise<SubmitResponse> => {
  return await reddit.post<SubmitResponse, CommentRequest>("/api/comment", commentReqeust);
};