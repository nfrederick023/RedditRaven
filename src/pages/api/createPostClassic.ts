import { ClassicPost, CommentRequest, SubmissionErrors, SubmitRequest } from "@client/utils/types";
import { NextApiRequest, NextApiResponse } from "next";
import { checkHashedPassword } from "@server/utils/auth";
import { submitComment, submitImagePost } from "@server/api/redditService";

const createPostClassic = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  if (!(checkHashedPassword(req.cookies.authToken ?? ""))) {
    res.statusCode = 401;
    res.end(JSON.stringify("Unauthorized"));
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const post: ClassicPost = JSON.parse(req.body).post;

  if (!post.imageLink) {
    res.status(400).json({ message: "Could not validate request!" });
    return;
  }

  const errors: SubmissionErrors[] = [];

  for (const postDetail of post.postDetails) {
    try {
      const postRequest: SubmitRequest = {
        title: postDetail.title,
        url: post.imageLink,
        api_type: "json",
        sr: postDetail.subreddit.name,
        submit_type: "subreddit",
        nsfw: postDetail.tags.includes("NSFW"),
        flair_id: postDetail.flair?.id,
        kind: "image",
        sendreplies: true,
        validate_on_submit: true,
        show_error_list: true,
        original_content: false,
        post_to_twitter: false,
        spoiler: false
      };


      const postResponse = await submitImagePost(postRequest);
      if (post.comment) {
        const commentReqeust: CommentRequest = {
          text: post.comment,
          thing_id: postResponse,
        };
        await submitComment(commentReqeust);
      }
    } catch (e) {
      errors.push({ subredditName: postDetail.subreddit.name, error: e });
    }
  }

  if (errors.length) {
    res.status(400).json(errors);
  }

  res.end();
};

export default createPostClassic;