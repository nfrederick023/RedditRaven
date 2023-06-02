import { Subreddit } from "../../src/utils/types";
import { getFlairsBySubbreddit, getSubbredditAbout } from "@server/api/redditService";
import fs from "fs-extra";

const mainDir = "RedditRaven";
const configDir = "config";
const subredditJSON = "subreddit_list.json";

export const getPath = (): string => {
  const dir = `/${mainDir}`;
  if (dir)
    return checkCreateDir(dir);
  throw ("Required: \"path\" configuration property not found!");
};

export const getConfigPath = (): string => {
  const dir = getPath() + `/${configDir}/`;
  return checkCreateDir(dir);
};

export const getSubredditsListPath = (): string => {
  const dir = getConfigPath() + subredditJSON;
  checkCreateJSON(dir, []);
  return dir;
};

export const setSubredditsList = (list: Subreddit[]): void => {
  fs.writeJSONSync(getSubredditsListPath(), list);
};

export const getSubredditsList = async (): Promise<Subreddit[]> => {
  const subreddits = fs.readJSONSync(getSubredditsListPath()) as Subreddit[];
  let isModified = false;

  const newSubreddits: Subreddit[] = [];
  // try and find values which may not be set. 
  for (const subreddit of subreddits) {
    const newSubreddit: Subreddit = {
      ...subreddit
    };

    if (typeof subreddit.notes === "undefined") {
      newSubreddit.notes = "";
      isModified = true;
    }
    if (typeof subreddit.categories === "undefined") {
      newSubreddit.categories = [];
      isModified = true;
    }

    // remove the subreddit if any of these are bad
    if (typeof subreddit.info.isCrosspostable === "undefined" || typeof subreddit.info.isNSFW === "undefined" || typeof subreddit.info.isNSFW === "undefined" || typeof subreddit.info.flairs === "undefined") {
      // if the name is defined, try to re-add the subreddit
      if (subreddit.name) {
        const [flairs, about] = await Promise.all([getFlairsBySubbreddit(subreddit.name), getSubbredditAbout(subreddit.name)]);
        newSubreddit.info = { flairs, ...about };
        newSubreddits.push(newSubreddit);
      }
      isModified = true;
    } else
      newSubreddits.push(newSubreddit);
  }
  console.log(isModified);

  if (isModified) {
    console.log("modifiying");
    setSubredditsList(newSubreddits);
  }
  return newSubreddits;
};

const checkCreateJSON = <T>(dir: string, defaultValue: T): string => {
  if (!fs.existsSync(dir))
    fs.writeJSONSync(dir, defaultValue);
  return dir;
};

const checkCreateDir = (dir: string): string => {
  if (!fs.existsSync(dir) || !fs.pathExistsSync(dir))
    fs.mkdirSync(dir);
  return dir;
};