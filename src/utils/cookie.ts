import type { CookieOptions } from "express";
import { env } from "../config/env.js";

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

export const getCookieValue=(cookieHeader: string,cookieName: string): string | undefined=> {
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name === cookieName) {
      return decodeURIComponent(valueParts.join("="));
    }
  }
  return undefined;
}
