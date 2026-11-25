import type { CookieOptions } from "express";
import { env } from "../config/env.js";
import { Response } from "express";

export const refreshCookieOptions:CookieOptions= {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path:"/"
};

export const accessCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/"
};


export const clearAuthCookies = (res: Response) => {
    res.clearCookie("accessToken",accessCookieOptions);
    res.clearCookie("refreshToken",refreshCookieOptions);
};
