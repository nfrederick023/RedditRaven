import { GetServerSideProps, NextPage } from "next";
import { Subreddit } from "@client/utils/types";
import { authGuard } from "@server/utils/auth";
import { getSubredditsList } from "@server/utils/config";
import ClassicPage from "@client/components/pages/classic/classic";
import React from "react";

interface ClassicProps {
  subreddits: Subreddit[];
}

const Index: NextPage<ClassicProps> = ({ subreddits }: ClassicProps) => {
  return (
    <>
      <ClassicPage {...{ subreddits }} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ClassicProps> = authGuard(async () => {
  return {
    props: {
      subreddits: await getSubredditsList(),
    },
  };
});

export default Index;
