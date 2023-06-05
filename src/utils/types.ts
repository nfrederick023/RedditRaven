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
}

export interface SubredditDefaults {
  title: string;
  flair: SubredditFlair | null;
  tags: Tags[];
}

export interface Subreddit {
  name: string;
  info: SubredditInfo;
  pivixTags: PixivTag[];
  defaults: SubredditDefaults;
  categories: string[];
  notes: string;
}

export enum AuthStatus {
  authenticated,
  notAuthenticated
}

export interface PixivDetails {
  imageLink?: string;
  pixivLink?: string;
  artist?: string;
  artistID?: string;
  artistLink?: string;
  pixivID?: string;
  description?: string;
  title?: string;
}

export interface Post {
  postDetails: PostTemplate[];
  comment: string;
  imageLink: string;
  dateTimeMS: number;
}

export interface PostTemplate {
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

export interface SubmitRequest {
  title: string;
  sr: string;
  url: string;
  nsfw: boolean;
  sendreplies: boolean;
  flair_id?: string;
  kind: "link" | "self" | "image" | "video" | "videogif";
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
