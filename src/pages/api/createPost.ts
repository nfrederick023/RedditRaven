import { CommentRequest, Post, SubmissionErrors, SubmitRequest, Subreddit, SubredditFlair } from "@client/utils/types";
import { NextApiRequest, NextApiResponse } from "next";
import { checkHashedPassword } from "@server/utils/auth";
import { getSubredditsList } from "@server/utils/config";
import { submitComment, submitImagePost, submitPost, waitForAwhile } from "@server/api/redditService";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "250mb" // Set desired value here
    }
  }
};

const createPost = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {

  if (!(checkHashedPassword(req.cookies.authToken ?? ""))) {
    res.statusCode = 401;
    res.end(JSON.stringify("Unauthorized"));
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const post: Post = JSON.parse(req.body) as Post;

  if (!post) {
    res.status(400).json({ message: "Could not validate request!" });
    return;
  }

  const subreddits = await getSubredditsList();

  subreddits.map(subreddit => {
    if (post.subreddit.name === subreddit.name) {
      subreddit.currentPage = Number(post.subreddit.currentPage) + "";
    }
    return subreddit;
  });

  const errors: SubmissionErrors[] = [];

  const generatePost = async (subreddit: Subreddit, flair: SubredditFlair | null): Promise<void> => {
    if (post.selectedImage) {
      const postRequest: SubmitRequest = {
        title: post.title,
        url: post.selectedImage.imageLink,
        api_type: "json",
        sr: subreddit.name,
        submit_type: "subreddit",
        nsfw: post.isNSFW,
        flair_id: flair?.id,
        kind: "image",
        sendreplies: true,
        validate_on_submit: true,
        original_content: false,
        show_error_list: true,
        post_to_twitter: false,
        spoiler: false
      };

      const imagePostResponse = await submitImagePost(postRequest);

      const commentReqeust: CommentRequest = {
        text: post.comment,
        thing_id: imagePostResponse,
      };

      if (post.comment) {
        await submitComment(commentReqeust);
      }

      delete postRequest.url;
      delete postRequest.flair_id;
      postRequest.kind = "crosspost";
      postRequest.crosspost_fullname = imagePostResponse;

      for (const crosspost of post.crossposts) {
        postRequest.sr = crosspost.name;
        postRequest.flair_id = crosspost.defaults.flair?.id;
        const postResponse = await submitPost(postRequest);
        commentReqeust.thing_id = postResponse.json.data.name;
        if (post.comment) {
          await submitComment(commentReqeust);
        }
      }
    }
  };

  try {
    await generatePost(post.subreddit, post.flair);
  } catch (e) {
    errors.push({ subredditName: post.subreddit.name, error: e });
  }

  for (const multipost of post.multipost) {
    const selectedSubreddit = subreddits.find(subreddit => subreddit.name === multipost);

    if (selectedSubreddit) {
      try {
        await generatePost(selectedSubreddit, selectedSubreddit.defaults.flair);
      } catch (e) {
        errors.push({ subredditName: selectedSubreddit.name, error: e });
      }
    }
  }


  if (errors.length) {
    res.statusCode = 500;
    res.json({ errors });
  } else {
    res.statusCode = 201;
  }

  res.end();
  return;
};

export default createPost;