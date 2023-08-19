import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
import { getCredentials } from "./config";
import { randomBytes, scryptSync } from "crypto";

export const authGuard = <T extends { [key: string]: unknown; }>(func: (ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>) => Promise<GetServerSidePropsResult<T>>): GetServerSideProps<T, ParsedUrlQuery, PreviewData> => {

  const newFunc: GetServerSideProps<T, ParsedUrlQuery, PreviewData> = async (ctx) => {
    const authToken = ctx.req.cookies?.authToken ?? "";
    const isAuthenticated = checkHashedPassword(authToken);

    if (!isAuthenticated) {
      if (authToken) ctx.res.setHeader("Set-Cookie", "authToken=; path=/;");
      if (!((ctx.req?.url ?? "") === "/login")) {
        ctx.res.writeHead(302, { Location: "/login" });
        ctx.res.end();
      }
    }

    return await func(ctx);
  };

  return newFunc;
};

export const checkHashedPassword = (hashedPassword: string): boolean => {
  const configPassword = getCredentials().PASSWORD;

  if (!configPassword) {
    return true;
  }

  const salt = hashedPassword.slice(64);
  const hashedConfigPassword = scryptSync(configPassword, salt, 32).toString("hex") + salt;
  return hashedConfigPassword === hashedPassword;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  return scryptSync(password, salt, 32).toString("hex") + salt;
};