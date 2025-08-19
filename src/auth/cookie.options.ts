// src/auth/cookie.options.ts
import { CookieOptions } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd, // true in production (HTTPS), false for local dev
  sameSite: isProd ? 'none' : 'lax', // for cross-site in prod, relax in dev
  path: '/', 
  maxAge: 1000 * 60 * 15, // 15 minutes (access token)
};
