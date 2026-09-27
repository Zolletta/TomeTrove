/**
 * Raw GitHub identity returned by GitHub OAuth API (/user).
 * Per PRIVACY.md, TomeTrove does not capture or store email, name, or profile information.
 * Only the unique numeric GitHub ID is extracted.
 */
export interface GitHubUser {
	readonly id: number;
}
