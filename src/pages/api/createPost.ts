import * as https from "https";
import { NextApiRequest, NextApiResponse } from "next";
import { Post } from "@client/types/types";
import { creds } from "@server/credentials/creds";
import Reddit from "reddit";

interface SubmitResponse {
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

interface SubmitRequest {
  title: string;
  url: string;
  sr: string;
  nsfw: boolean;
}

interface CommentResponse {
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

interface CommentRequest {
  text: string;
  thing_id: string;
}



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

  const reddit: Reddit = new Reddit({
    username: creds.REDDIT_USERNAME,
    password: creds.PASSWORD,
    appId: creds.APP_ID,
    appSecret: creds.APP_SECRET
  });

  post.postDetails.forEach(async postDetail => {
    const postRequest: SubmitRequest = {
      title: postDetail.title,
      url: post.imageLink,
      sr: postDetail.subreddit.name,
      nsfw: postDetail.tags.includes("NSFW")
    };

    const postResponse = await reddit.post<SubmitResponse, SubmitRequest>("/api/submit", postRequest);
    if (post.comment) {
      const commentReqeust: CommentRequest = {
        text: post.comment,
        thing_id: postResponse.json.data.name,
      };
      await reddit.post<SubmitResponse, CommentRequest>("/api/comment", commentReqeust);
    }
  });




  res.end();
};

export default createPost;