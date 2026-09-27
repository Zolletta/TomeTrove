import { sign, verify } from "hono/jwt";
import type { GitHubUser, SessionPayload } from "../types/auth";

/**
 * Service orchestrating GitHub OAuth handshake and session JWT lifecycle.
 * Per ADR 0012, methods are implemented as arrow function properties to bind
 * `this` lexically at instance creation time.
 */
export class AuthService {
	/**
	 * Builds the GitHub OAuth authorization redirect URL.
	 * Minimal scope `read:user` is requested; email and profile scopes are omitted per PRIVACY.md.
	 */
	generateAuthUrl = (
		clientId: string,
		redirectUri: string,
		state: string,
	): string => {
		const url = new URL("https://github.com/login/oauth/authorize");
		url.searchParams.set("client_id", clientId);
		url.searchParams.set("redirect_uri", redirectUri);
		url.searchParams.set("state", state);
		url.searchParams.set("scope", "read:user");
		url.searchParams.set("allow_signup", "true");
		return url.toString();
	};

	/**
	 * Exchanges the temporary OAuth authorization code for a GitHub access token.
	 */
	exchangeCodeForToken = async (
		code: string,
		clientId: string,
		clientSecret: string,
		redirectUri: string,
	): Promise<string> => {
		const response = await fetch(
			"https://github.com/login/oauth/access_token",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					"User-Agent": "TomeTrove-Workers",
				},
				body: JSON.stringify({
					client_id: clientId,
					client_secret: clientSecret,
					code,
					redirect_uri: redirectUri,
				}),
			},
		);

		if (!response.ok) {
			throw new Error(
				`GitHub token exchange failed with status ${response.status}`,
			);
		}

		const data = (await response.json()) as {
			access_token?: string;
			error?: string;
			error_description?: string;
		};
		if (data.error || !data.access_token) {
			throw new Error(
				data.error_description ||
					data.error ||
					"Missing access token in GitHub response",
			);
		}

		return data.access_token;
	};

	/**
	 * Fetches the user identity from GitHub API and extracts only the unique numeric ID.
	 * Per PRIVACY.md, email, name, and profile metadata are discarded immediately.
	 */
	fetchGitHubUser = async (accessToken: string): Promise<GitHubUser> => {
		const response = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github.v3+json",
				"User-Agent": "TomeTrove-Workers",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch user profile from GitHub with status ${response.status}`,
			);
		}

		const data = (await response.json()) as { id?: number };
		if (typeof data.id !== "number") {
			throw new Error("Invalid GitHub user response: missing numeric id");
		}

		return { id: data.id };
	};

	/**
	 * Signs a cryptographic HS256 JWT session token with a 7-day expiration by default.
	 */
	createSessionToken = async (
		userId: string,
		githubId: number,
		secret: string,
		expiresInSeconds: number = 60 * 60 * 24 * 7,
	): Promise<string> => {
		const now = Math.floor(Date.now() / 1000);
		const payload: SessionPayload = {
			sub: userId,
			github_id: githubId,
			iat: now,
			exp: now + expiresInSeconds,
		};

		return await sign(payload as unknown as Record<string, unknown>, secret);
	};

	/**
	 * Validates token cryptographic signature and expiration, returning decoded session claims.
	 */
	verifySessionToken = async (
		token: string,
		secret: string,
	): Promise<SessionPayload | null> => {
		try {
			const decoded = (await verify(
				token,
				secret,
				"HS256",
			)) as unknown as Partial<SessionPayload>;
			const now = Math.floor(Date.now() / 1000);

			if (
				!decoded.sub ||
				typeof decoded.github_id !== "number" ||
				!decoded.exp
			) {
				return null;
			}

			if (decoded.exp <= now) {
				return null;
			}

			return {
				sub: String(decoded.sub),
				github_id: Number(decoded.github_id),
				exp: Number(decoded.exp),
				iat: Number(decoded.iat || now),
			};
		} catch {
			return null;
		}
	};
}

export const authService = new AuthService();
