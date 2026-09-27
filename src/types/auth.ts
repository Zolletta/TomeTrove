/**
 * Data contracts and DTOs for authentication.
 *
 * Per ADR 0011, data shapes are modeled as TypeScript interfaces with readonly fields.
 * Per PRIVACY.md, TomeTrove does not capture, store, or profile GitHub emails, names, or avatars.
 * Only the unique numeric GitHub ID is utilized for authentication.
 */

export interface GitHubUser {
	readonly id: number;
}

export interface SessionPayload {
	readonly sub: string;
	readonly github_id: number;
	readonly exp: number;
	readonly iat: number;
}

export interface UserProfileResponse {
	readonly user_id: string;
	readonly user_github_id: string;
	readonly preferences_completed: boolean;
}

export interface AppEnv {
	readonly ENVIRONMENT?: string;
	readonly APP_URL?: string;
	readonly GITHUB_CLIENT_ID?: string;
	readonly GITHUB_CLIENT_SECRET?: string;
	readonly JWT_SECRET?: string;
	readonly DATABASE_URL?: string;
}
