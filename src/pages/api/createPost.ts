import { CommentRequest, Post, SubmissionErrors, SubmitRequest, Subreddit, SubredditFlair } from "@client/utils/types";
import { NextApiRequest, NextApiResponse } from "next";
import { checkHashedPassword } from "@server/utils/auth";
import { getImageURL } from "@server/api/getPixivDetails";
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

  if (!(checkHashedPassword(req.cookies.authToken ?? ""))) {
    res.statusCode = 401;
    res.end(JSON.stringify("Unauthorized"));
    return;
  }

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

  let eightKBString = "";
  for (let i = 0; i < 1024 * 8; i++) {
    eightKBString += "\n";
  }

  const subreddits = await getSubredditsList();
  const errors: SubmissionErrors[] = [];
  const queuedPosts: Promise<void>[] = [];

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

          try {
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
          } catch (e) {
            errors.push({ subredditName: post.subreddit.name, error: e });
          }

          // this is needed because cloudflare sucks dick
          // https://github.com/marcialpaulg/Fixing-Cloudflare-Error-524
          res.write(eightKBString);
        } else {
          // eslint-disable-next-line no-console
          console.warn("Failed to create post. No link retrieved!\nSubreddit:" + post.subreddit.name);
        }
      }
    };
    queuedPosts.push(generatePost(post.subreddit, post.flair));

    for (const multipost of post.multipost) {
      const selectedSubreddit = subreddits.find(subreddit => subreddit.name === multipost);

      if (selectedSubreddit) {
        await generatePost(selectedSubreddit, selectedSubreddit.defaults.flair);
        queuedPosts.push(generatePost(post.subreddit, post.flair));
      }
    }
  }

  await Promise.all(queuedPosts);

  subreddits.map(subreddit => {
    const matchingPost = posts.find(post => post.subreddit.name === subreddit.name);
    if (matchingPost) {
      subreddit.currentPage = Number(matchingPost.subreddit.currentPage) + "";
    }
    return subreddit;
  });

  setSubredditsList(subreddits);

  if (errors.length) {
    res.write(JSON.stringify(errors));
    res.status(400);
  } else {
    res.status(201);
  }

  res.end();
  return;
};

export default createPost;