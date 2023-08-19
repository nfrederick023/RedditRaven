import { GetServerSideProps, NextPage } from "next";
import { Subreddit } from "@client/utils/types";
import { authGuard } from "@server/utils/auth";
import { getSubredditsList } from "@server/utils/config";
import IndexPage from "@client/components/pages/index/index";
import React from "react";

interface IndexProps {
  subreddits: Subreddit[];
}

const Index: NextPage<IndexProps> = ({ subreddits }: IndexProps) => {
  return (
    <>
      <IndexPage {...{ subreddits }} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<IndexProps> = authGuard(async () => {
  return {
    props: {
      subreddits: await getSubredditsList(),
    },
  };
});

export default Index;
