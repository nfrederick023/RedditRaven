export interface SubredditFlair {
  readonly name: string;
  readonly isTextEditable: boolean;
  readonly id: string;
}

export interface SubredditAbout {
  readonly url: string;
  readonly allowsVideoGifs: boolean;
  readonly allowsVideos: boolean;
  readonly isCrosspostable: boolean;
  readonly isNSFW: boolean;
}

export interface SubredditInfo extends SubredditAbout {
  readonly flairs: SubredditFlair[];
}

export interface Subreddit {
  readonly name: string;
  readonly info: SubredditInfo;
  readonly categories: string[];
  readonly notes: string[];
}

export enum AuthStatus {
  authenticated,
  notAuthenticated
}
