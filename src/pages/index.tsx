import { GetServerSideProps, NextPage } from "next";

import React from "react";

import { AuthContext } from "@client/contexts/authContext";
import { Subreddit } from "@client/types/types";
import { getSubredditsList } from "@server/utils/config";
import IndexPage from "@client/components/Index";

interface IndexProps {
  subreddits: Subreddit[];
}

const Index: NextPage<IndexProps> = ({ subreddits }: IndexProps) => {
  const authContext = React.useContext(AuthContext);
  return (
    <>
      <IndexPage {...{ subreddits }} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<IndexProps> = async () => {
  return {
    props: {
      subreddits: await getSubredditsList(),
    },
  };
};

export default Index;
