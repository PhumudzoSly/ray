export const APP_NAME = "Ray AI";
export const AUTH_TITLE = "Ray AI";
export const AUTH_DESCRIPTION =
  "Your vibe-coded projects deserves a bit of flow ";

export const appConfig = {
  root_domain: "https://rayai.dev",
  app_domain: "https://rayai.dev",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://rayai.dev",
  ],
};

/**
 * List of all routes that are not protected
 * These routes are used for auth only
 * @type {string[]}
 */
export const authRoutes = [
  // AUTH PAGES
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/reset-password",
  "/auth/new-password",
  "/verify-email",

  //PUBLIC
  "/",
  "/rm",
  "/home",
  "/api/inngest",
  "/stay-tuned",
];

/**
 * Prefix for auth API
 */
export const apiPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = process.env.NODE_ENV === "production" ? "/stay-tuned" : "/switch-org";
