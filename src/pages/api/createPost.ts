import { CommentRequest, Post, SubmitRequest, Subreddit, SubredditFlair } from "@client/utils/types";
import { NextApiRequest, NextApiResponse } from "next";
import { getImageLink, getImageURL } from "@server/api/getPixivDetails";
import { getSubredditsList, setSubredditsList } from "@server/utils/config";
import { submitComment, submitImagePost, submitPost } from "@server/api/redditService";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "250mb" // Set desired value here
    }
  }
};

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

  const subreddits = await getSubredditsList();

  for (const post of posts) {
    const generatePost = async (subreddit: Subreddit, flair: SubredditFlair | null): Promise<void> => {
      if (post.selectedImage) {
        const link = await getImageURL(post.selectedImage.smallImageLink, post.selectedImage.pixivID, post.selectedImage.frame);
        if (link) {
          const postRequest: SubmitRequest = {
            title: post.title,
            url: link,
            api_type: "json",
            sr: subreddit.name,
            submit_type: "subreddit",
            nsfw: post.isNSFW,
            flair_id: flair?.id,
            kind: "image",
            sendreplies: true,
            validate_on_submit: true,
            original_content: false,
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

          postRequest.kind = "crosspost";
          postRequest.crosspost_fullname = imagePostResponse;

          for (const crosspost of post.crossposts) {
            postRequest.sr = crosspost;
            const postResponse = await submitPost(postRequest);
            commentReqeust.thing_id = postResponse.json.data.name;
            if (post.comment) {
              await submitComment(commentReqeust);
            }
          }

        } else {
          // eslint-disable-next-line no-console
          console.warn("Failed to create post. No link retrieved!\nSubreddit:" + post.subreddit.name);
        }
      }
    };

    generatePost(post.subreddit, post.flair);

    for (const multipost of post.multipost) {
      const selectedSubreddit = subreddits.find(subreddit => subreddit.name === multipost);

      if (selectedSubreddit)
        generatePost(selectedSubreddit, selectedSubreddit.defaults.flair);
    }
  }

  subreddits.map(subreddit => {
    const matchingPost = posts.find(post => post.subreddit.name === subreddit.name);
    if (matchingPost) {
      subreddit.currentPage = Number(matchingPost.subreddit.currentPage) + "";
    }
    return subreddit;
  });

  setSubredditsList(subreddits);
  res.status(201);
  res.end();
  return;
};

export default createPost;