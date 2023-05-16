import { NextApiRequest, NextApiResponse } from "next";
import { Subreddit } from "@client/utils/types";
import { getFlairsBySubbreddit, getSubbredditAbout } from "@server/api/redditService";
import { getSubredditsList, setSubredditsList } from "@server/utils/config";

const addSubreddit = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  if (req.method !== "POST" && req.method !== "DELETE") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  if (req.method === "POST") {
    const name: string | undefined = JSON.parse(req.body)?.name;
    if (!name) {
      res.status(400).json({ message: "No subreddit name was provided." });
      return;
    }

    const subredditList = getSubredditsList();

    if (subredditList.find(subreddit => subreddit.name === name)) {
      res.status(400).json({ message: "Subreddit is already in the list!" });
      return;
    }

    const [flairs, about] = await Promise.all([getFlairsBySubbreddit(name), getSubbredditAbout(name)]);

    const newSubreddit: Subreddit = {
      name,
      categories: [],
      notes: "",
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

    const subredditList = getSubredditsList();

    if (!subredditList.find(subreddit => subreddit.name === name)) {
      res.status(400).json({ message: "Subreddit isn't in the list!" });
      return;
    }

    const newSubredditList = subredditList.filter(subreddit => subreddit.name !== name);
    setSubredditsList(newSubredditList);
    res.status(200).send(newSubredditList);
    return;
  }
};

export default addSubreddit;