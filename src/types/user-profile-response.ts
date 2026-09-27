/**
 * Data contract for GET /api/user/me response.
 */
export interface UserProfileResponse {
	readonly user_id: string;
	readonly user_github_id: string;
	readonly preferences_completed: boolean;
}
