/**
 * Cloudflare Worker environment variables and secrets interface.
 */
export interface AppEnv {
	readonly ENVIRONMENT?: string;
	readonly APP_URL?: string;
	readonly GITHUB_CLIENT_ID?: string;
	readonly GITHUB_CLIENT_SECRET?: string;
	readonly JWT_SECRET?: string;
	readonly DATABASE_URL?: string;
}
