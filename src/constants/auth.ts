/**
 * Authentication and OAuth configuration constants.
 */

// GitHub OAuth endpoints
export const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
export const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
export const GITHUB_USER_URL = "https://api.github.com/user";

// OAuth and request headers
export const GITHUB_OAUTH_SCOPE = "read:user";
export const APP_USER_AGENT = "TomeTrove-Workers";

// Session & Cookie configurations
export const SESSION_COOKIE_NAME = "tometrove_session";
export const OAUTH_STATE_COOKIE_NAME = "oauth_state";

export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const OAUTH_STATE_COOKIE_MAX_AGE_SECONDS = 600; // 10 minutes

// Cryptographic algorithm
export const JWT_ALGORITHM = "HS256";
