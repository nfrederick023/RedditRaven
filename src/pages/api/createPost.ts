import { CommentRequest, Post, SubmitRequest } from "@client/utils/types";
import { NextApiRequest, NextApiResponse } from "next";
import { submitComment, submitPost } from "@server/api/redditService";

const createPost = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const post: Post = JSON.parse(req.body).post;

  if (!post.imageLink) {
    res.status(400).json({ message: "Could not validate request!" });
    return;
  }

  post.postDetails.forEach(async postDetail => {
    const postRequest: SubmitRequest = {
      title: postDetail.title,
      url: post.imageLink,
      sr: postDetail.subreddit.name,
      nsfw: postDetail.tags.includes("NSFW")
    };

    const postResponse = await submitPost(postRequest);
    if (post.comment) {
      const commentReqeust: CommentRequest = {
        text: post.comment,
        thing_id: postResponse.json.data.name,
      };
      await submitComment(commentReqeust);
    }
  });

  res.end();
};

export default createPost;