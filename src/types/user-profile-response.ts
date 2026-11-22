/**
 * Data contract for GET /api/user/me response.
 */
export interface UserProfileResponse {
	readonly user_id: number;
	readonly user_github_id: number;
	readonly preferences_completed: boolean;
}
