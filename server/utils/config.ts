import { Subreddit } from "../../src/utils/types";
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

export const getSubredditsList = (): Subreddit[] => {
  return fs.readJSONSync(getSubredditsListPath()) as Subreddit[];
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