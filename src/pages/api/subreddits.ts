import { NextApiRequest, NextApiResponse } from "next";
import { Subreddit } from "@client/utils/types";
import { getFlairsBySubbreddit, getSubbredditAbout } from "@server/api/redditService";
import { getSubredditsList, setSubredditsList } from "@server/utils/config";

const addSubreddit = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  if (req.method !== "POST" && req.method !== "DELETE" && req.method !== "PUT") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  if (req.method === "POST") {
    const name: string | undefined = JSON.parse(req.body)?.name;
    if (!name) {
      res.status(400).json({ message: "No subreddit name was provided." });
      return;
    }

    const subredditList = await getSubredditsList();

    if (subredditList.find(subreddit => subreddit.name === name)) {
      res.status(400).json({ message: "Subreddit is already in the list!" });
      return;
    }

    const [flairs, about] = await Promise.all([getFlairsBySubbreddit(name), getSubbredditAbout(name)]);

    const newSubreddit: Subreddit = {
      name,
      categories: [],
      notes: "",
      defaults: {
        title: "",
        tags: [],
        flair: null
      },
      pivixTags: [],
      info: { flairs, ...about },
    };

    subredditList.push(newSubreddit);
    setSubredditsList(subredditList);
    res.status(200).send(subredditList);
    return;
  }

  if (req.method === "DELETE") {
    const name: string | undefined = JSON.parse(req.body)?.name;
    if (!name) {
      res.status(400).json({ message: "No subreddit name was provided." });
      return;
    }

    const subredditList = await getSubredditsList();

    if (!subredditList.find(subreddit => subreddit.name === name)) {
      res.status(400).json({ message: "Subreddit isn't in the list!" });
      return;
    }

    const newSubredditList = subredditList.filter(subreddit => subreddit.name !== name);
    setSubredditsList(newSubredditList);
    res.status(200).send(newSubredditList);
    return;
  }

  if (req.method === "PUT") {
    const subreddits: Subreddit[] = JSON.parse(req.body)?.subreddits;
    try {
      setSubredditsList(subreddits);
      res.status(200).end();
    } catch (e) {
      res.status(500).json({ message: "Failed to save subreddits." });
    }
  }
  return;
};

export default addSubreddit;