/**
 * Claims contained within the signed HS256 JWT session token.
 */
export interface SessionPayload {
	readonly sub: string;
	readonly github_id: number;
	readonly exp: number;
	readonly iat: number;
}
