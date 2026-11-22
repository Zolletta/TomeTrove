/**
 * Claims contained within the signed HS256 JWT session token.
 * `sub` is the internal `user_id` as a decimal string (RFC 7519 requires a
 * string); `github_id` is the numeric GitHub user id.
 */
export interface SessionPayload {
	readonly sub: string;
	readonly github_id: number;
	readonly exp: number;
	readonly iat: number;
}

/** A verified session, with `sub` parsed back to the numeric `user_id`. */
export interface Session {
	readonly userId: number;
	readonly githubId: number;
	readonly exp: number;
	readonly iat: number;
}
