import { Optional } from "../types/optional";

export abstract class Leaderboard {

	private static readonly KEY = "highestScore" as const;

	private static highestScoreCache: Optional<number> = null;
	public static isCurrentHighest = false;

	public static get highestScore() {
		if (this.highestScoreCache) return this.highestScoreCache;

		const score = localStorage.getItem(this.KEY);
		if (score) {
			this.highestScoreCache = parseInt(score, 10);

			return this.highestScoreCache;
		} else {
			return 0;
		}
	}

	public static set highestScore(value: number) {
		this.highestScoreCache = value;
		this.isCurrentHighest = true;
		localStorage.setItem(this.KEY, value.toString());
	}

}