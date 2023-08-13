import { CommentRequest, Post, SubmitRequest } from "@client/utils/types";
import { NextApiRequest, NextApiResponse } from "next";
import { getSubredditsList, setSubredditsList } from "@server/utils/config";
import { submitComment, submitPost } from "@server/api/redditService";

const createPost = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const body: { posts: Post[] } = JSON.parse(req.body) as { posts: Post[] };
  const posts = body.posts;

  if (!posts) {
    res.status(400).json({ message: "Could not validate request!" });
    return;
  }

  for (const post of posts) {
    if (post.selectedImage) {
      const postRequest: SubmitRequest = {
        title: post.title,
        url: post.selectedImage.imageLink,
        api_type: "json",
        sr: post.subreddit.name,
        submit_type: "subreddit",
        nsfw: post.isNSFW,
        flair_id: post.flair?.id,
        kind: "image",
        sendreplies: true,
        validate_on_submit: true
      };
      const postResponse = await submitPost(postRequest);
      if (post.comment) {
        const commentReqeust: CommentRequest = {
          text: post.comment,
          thing_id: postResponse,
        };
        await submitComment(commentReqeust);
      }
    }
  }

  const subreddits = await getSubredditsList();

  subreddits.map(subreddit => {
    const matchingPost = posts.find(post => post.subreddit.name === subreddit.name);
    if (matchingPost) {
      subreddit.currentPage = (Number(matchingPost.subreddit.currentPage) + 1) + "";
    }
    return subreddit;
  });

  setSubredditsList(subreddits);
  res.status(201);
  res.end();
  return;
};

export default createPost;