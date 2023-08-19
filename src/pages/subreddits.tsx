import { GetServerSideProps, NextPage } from "next";
import { Subreddit } from "@client/utils/types";
import { authGuard } from "@server/utils/auth";
import { getSubredditsList } from "@server/utils/config";
import React from "react";
import SubredditsPage from "@client/components/pages/subreddits/subreddits";

interface SubredditsProps {
  subreddits: Subreddit[];
}

const Subreddits: NextPage<SubredditsProps> = ({ subreddits }: SubredditsProps) => {
  return (
    <>
      <SubredditsPage {...{ subreddits }} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<SubredditsProps> = authGuard(async () => {
  return {
    props: {
      subreddits: await getSubredditsList(),
    },
  };
});

export default Subreddits;
