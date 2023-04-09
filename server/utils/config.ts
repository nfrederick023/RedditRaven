import { Subreddit } from "../../src/types/types";

interface Config {
  password: string;
  privateLibrary: boolean;
  thumbnailSize: string;
}

const mainDir = "RedditRaven";
const configDir = "config";
const configBackupDir = "backups";
const configJSON = "config.json";
const subredditJSON = "subreddit_list.json";

export const getUserPassword = async (): Promise<string> => {
  return (await getConfig()).password;
};

export const getPrivateLibrary = async (): Promise<boolean> => {
  return (await getConfig()).privateLibrary;
};

export const getThumnailSize = async (): Promise<string> => {
  return (await getConfig()).thumbnailSize;
};

export const getPath = async (): Promise<string> => {
  const dir = `/${mainDir}`;
  if (dir)
    return checkCreateDir(dir);
  throw ("Required: \"path\" configuration property not found!");
};

export const getConfigPath = async (): Promise<string> => {
  const dir = await getPath() + `/${configDir}/`;
  return checkCreateDir(dir);
};

export const getBackupPath = async (): Promise<string> => {
  const dir = await getConfigPath() + `/${configBackupDir}/`;
  return checkCreateDir(dir);
};

export const getSubredditsListPath = async (): Promise<string> => {
  const dir = await getConfigPath() + subredditJSON;
  await checkCreateJSON(dir, []);
  return dir;
};

export const getConfigJSONPath = async (): Promise<string> => {
  const dir = await getConfigPath() + configJSON;

  const defaultConfig: Config = {
    password: "test",
    privateLibrary: true,
    thumbnailSize: "1920x1080"
  };

  await checkCreateJSON(dir, defaultConfig);
  return dir;
};

export const setSubredditsList = async (list: Subreddit[]): Promise<void> => {
  const fse = await import("fs-extra");
  await fse.writeJSON(await getSubredditsListPath(), list);
};

export const getSubredditsList = async (): Promise<Subreddit[]> => {
  const fse = await import("fs-extra");
  return await fse.readJSON(await getSubredditsListPath()) as Subreddit[];
};

export const getConfig = async (): Promise<Config> => {
  const fse = await import("fs-extra");
  return await fse.readJSON(await getConfigJSONPath()) as Config;
};

const checkCreateJSON = async <T>(dir: string, defaultValue: T): Promise<string> => {
  const fse = await import("fs-extra");
  if (!fse.existsSync(dir))
    await fse.writeJSON(dir, defaultValue);
  return dir;
};

const checkCreateDir = async (dir: string): Promise<string> => {
  const fse = await import("fs-extra");

  if (!fse.existsSync(dir) || !await fse.pathExists(dir))
    await fse.mkdir(dir);
  return dir;
};