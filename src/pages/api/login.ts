/**
 * Login handler
 */

import { Request, Response } from "express";
import { getCredentials } from "@server/utils/config";
import { hashPassword } from "@server/utils/auth";


const login = async (req: Request, res: Response): Promise<void> => {

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end();
    return;
  }

  const userPassword = getCredentials().PASSWORD;

  if (req.body && "password" in req.body && userPassword === req.body["password"] && userPassword) {
    const hashedPassword = await hashPassword(userPassword);
    res.statusCode = 200;
    res.end(hashedPassword);
    return;
  }

  res.statusCode = 400;
  res.end("Login Failed!");
  return;
};

export default login;