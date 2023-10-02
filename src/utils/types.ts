export interface SubredditFlair {
  readonly name: string;
  readonly isTextEditable: boolean;
  readonly id: string;
}

export interface BluJayTheme {
  readonly background: string;
  readonly backgroundContrast: string;
  readonly text: string;
  readonly textContrast: string;
  readonly textContrastLight: string;
  readonly highlightLight: string;
  readonly highlightDark: string;
  readonly hightlightSilver: string;
  readonly button: string;
}

export interface ScreenSizes {
  readonly largeScreenSize: number;
  readonly mediumScreenSize: number;
  readonly smallScreenSize: number;
  readonly tabletScreenSize: number;
  readonly mobileScreenSize: number;
}

export interface SubredditAbout {
  url: string;
  isCrosspostable: boolean;
  isNSFW: boolean;
}

export interface SubredditInfo extends SubredditAbout {
  readonly flairs: SubredditFlair[];
}

export interface PixivTag {
  jpName: string;
  enName: string;
  link: string;
  title: string;
}

export interface SubredditDefaults {
  title: string;
  flair: SubredditFlair | null;
  tags: Tags[];
  pixivTag: PixivTag | undefined;
}

export interface Subreddit {
  name: string;
  info: SubredditInfo;
  pivixTags: PixivTag[];
  primaryTag: PixivTag | undefined;
  defaults: SubredditDefaults;
  categories: string[];
  currentPage: string;
  notes: string;
}

export enum AuthStatus {
  authenticated,
  notAuthenticated
}

export interface PixivDetails {
  imageLink: string;
  frame: string;
  smallImageLink: string;
  pixivLink: string;
  artist: string;
  artistID: string;
  artistLink: string;
  pixivID: string;
  description: string;
  likeCount: number;
  bookmarkCount: number;
  title: string;
  imageBlob?: string;
  tags: string[];
}

export interface LimitedPixivDetails {
  smallImageLink: string;
  pixivLink: string;
  artist: string;
  artistID: string;
  pixivID: string;
  likeCount: number;
  bookmarkCount: number;
  title: string;
  imageBlob?: string;
  tags: string[];
}

export interface Post {
  subreddit: Subreddit;
  selectedImage: PixivDetails | undefined;
  flair: SubredditFlair | null;
  isNSFW: boolean;
  usesDefaultComment: boolean;
  suggestedImages: PixivDetails[];
  slice: number;
  comment: string;
  pixivTag: PixivTag | undefined;
  title: string;
  isLoading: boolean;
  multipost: string[];
  crossposts: Subreddit[];
  customLink: string;
}

export interface ClassicPost {
  postDetails: ClassicPostTemplate[];
  comment: string;
  imageLink: string;
}

export interface ClassicPostTemplate {
  subreddit: Subreddit;
  flair: SubredditFlair | null;
  tags: Tags[];
  title: string;
}

export type Tags = "NSFW" | "OC" | "Spoiler";

export interface SubmitResponse {
  json: {
    errors: string[],
    data: {
      url: string,
      drafts_count: number,
      id: string,
      name: string
    }
  }
}

export interface ResubmitResponse {
  json: {
    errors: string[],
    data: {
      websocket_url: string,
    }
  }
}

export interface SubmitRequest {
  title: string;
  sr: string;
  url?: string;
  nsfw: boolean;
  sendreplies: boolean;
  submit_type: string;
  flair_id?: string;
  api_type: string;
  validate_on_submit: boolean;
  crosspost_fullname?: string;
  kind: "link" | "self" | "image" | "video" | "videogif" | "crosspost";
  original_content: boolean;
  post_to_twitter: boolean;
  spoiler: boolean;
}

export interface CommentResponse {
  json: {
    errors: string[],
    data: {
      url: string,
      drafts_count: number,
      id: string,
      name: string
    }
  }
}

export interface CommentRequest {
  text: string;
  thing_id: string;
}

export type SuggestedImages = { suggestedImages: PixivDetails[] };
export type SuggestedImagesReq = { pixivTag: PixivTag | undefined, page: string, slice: number, count: number; token: string };

export interface Credentials {
  SAUCENAO_KEY: string;
  REDDIT_USERNAME: string;
  REDDIT_PASSWORD: string;
  APP_ID: string;
  APP_SECRET: string;
  PIXIV_TOKEN: string;
  PASSWORD: string;
}

export type CookieTypes = "authToken"

export interface SubmissionErrors {
  subredditName: string;
  error: unknown;
}