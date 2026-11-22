/**
 * Claims contained within the signed HS256 JWT session token.
 * `sub` is the internal `user_id`; `github_id` is the numeric GitHub user id.
 */
export interface SessionPayload {
	readonly sub: number;
	readonly github_id: number;
	readonly exp: number;
	readonly iat: number;
}
