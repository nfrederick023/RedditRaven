import { CookieTypes } from "./types";

interface CookieSetOptions {
  path: string;
  sameSite: boolean;
  maxAge: number;
  expires: Date;
}

export const getCookieSetOptions = (): CookieSetOptions => {
  return { path: "/", sameSite: true, maxAge: 31536000, expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) };
};

export const getCookieDefault = (name: CookieTypes): boolean | string | number => {
  switch (name) {
    case "authToken":
      return "";
    default:
      return "";
  }
};