import { Main } from "../main";
import { AState } from "../types/state";
import { Log } from "../utils/log";
import { Cursor } from "../utils/cursor";
import { CursorType } from "../types/cursor-type";
import { Dinosaur } from "../models/dinosaur";
import { Ground } from "../models/ground";
import { AObstacle } from "../types/obstacle";
import { ObstacleSpawner } from "../models/obstacle-spawner";
import { Theme } from "../utils/theme";
import { FONT_FAMILY, FONT_SIZE, GOD_MODE, MARGIN, MOBILE_SPEED_FACTOR, SCORE_INTERVAL } from "../constants";
import { ImageUtils } from "../utils/image";
import { AudioUtils } from "../utils/audio";
import { SoundFX } from "../types/soundfx";
import { StateGameOver } from "./state-game-over";
import { TextAlign } from "../types/text-align";
import { Leaderboard } from "../utils/leaderboard";
import { InputHandler } from "../components/input-handler";

export class StatePlay extends AState {

	public ground: Ground;
	public dino: Dinosaur;
	public obstacles: AObstacle[];

	private spawner: ObstacleSpawner;

	private scoreTimer = 0;
	private rawSpeed = 0;
	private rawScore = 0;
	private lives = 0;

	public isInvulnerable = false;
	public invulnerabilityTimer = 0;

	constructor(public main: Main) {
		super();
	}

	// #region Utility
	public get width() {
		return this.main.screen.width;
	}

	public get height() {
		return this.main.screen.height;
	}

	public get score() {
		return Math.floor(this.rawScore).toString().padStart(4, "0");
	}

	public get speed() {
		return this.rawSpeed * (window.isMobile() ? MOBILE_SPEED_FACTOR : 1.0);
	}

	public invalidate() {
		this.main.invalidate();
	}
	// #endregion

	async setup() {
		Log.debug("StatePlay", "Setting up...");

		Leaderboard.isCurrentHighest = false;

		this.lives = 3;
		this.rawScore = 0;
		this.rawSpeed = 0;

		this.dino = new Dinosaur(this);
		this.ground = new Ground(this);
		this.obstacles = [];

		this.spawner = new ObstacleSpawner(this);

		if (!DEBUG) Cursor.set(CursorType.Hidden);
	}

	// #region Update
	private onHitObstacle() {
		Log.debug("StatePlay", "Dino hit by obstacle!");
		InputHandler.vibrate();
		if (this.lives > 1) {
			this.isInvulnerable = true;
			this.invulnerabilityTimer = 0;
			this.lives -= 1;
			AudioUtils.play(SoundFX.Phase);
		} else if (!GOD_MODE) {
			AudioUtils.play(SoundFX.GameOver);
			this.main.setState(new StateGameOver(this.ground, this.dino, this.obstacles, this.score, this.main));
		}
	}

	private updateScore(deltaTime: number) {
		this.scoreTimer += deltaTime;
		if (this.scoreTimer >= SCORE_INTERVAL) {
			this.scoreTimer -= SCORE_INTERVAL;
			this.rawScore++;
			if (Leaderboard.highestScore < this.rawScore) Leaderboard.highestScore = Math.floor(this.rawScore);

			if (this.rawScore % 100 === 0) {
				AudioUtils.play(SoundFX.Score);
			}
		}
	}

	private updateSpeed(deltaTime: number) {
		if (this.rawSpeed < 1.0) {
			// Accelerate the whole game
			// I don't want a new variable to track the elapsed time, since this will be only used on the ramp-up phase
			this.rawSpeed += (2.0 * Math.sqrt(this.rawSpeed) * deltaTime + deltaTime * deltaTime);
		} else {
			this.rawSpeed += 0.003 * deltaTime;
		}
	}

	async update(deltaTime: number) {
		this.updateScore(deltaTime);
		this.updateSpeed(deltaTime);
		this.spawner.update(deltaTime);
		this.ground.update(deltaTime);
		this.dino.update(deltaTime);

		for (let i = this.obstacles.length - 1; i >= 0; i--) {
			const obstacle = this.obstacles[i];
			obstacle.update(deltaTime);

			if (obstacle.isOutOfScreen) {
				this.obstacles.splice(i, 1);
			} else if (!this.isInvulnerable && ImageUtils.pixelPerfectCollision(this.dino.position, this.dino.sprite, obstacle.position, obstacle.sprite)) {
				this.onHitObstacle();
			}
		}

		this.invalidate();
	}
	// #endregion

	render(ctx: CanvasRenderingContext2D): void {
		this.ground.render(ctx);
		this.obstacles.forEach(x => x.render(ctx));
		this.dino.render(ctx);

		// Score
		ctx.font = `${FONT_SIZE / 3}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Theme.foreground;
		ctx.textBaseline = "top";
		if (Leaderboard.isCurrentHighest) {
			ctx.fillTextAligned(`HI Score: ${this.score}`, this.width - MARGIN, MARGIN, TextAlign.Right);
		} else {
			ctx.fillTextAligned(`Score: ${this.score}`, this.width - MARGIN, MARGIN, TextAlign.Right);
		}
		ctx.fillTextAligned(`Lives: ${this.lives}`, this.width - MARGIN, MARGIN + FONT_SIZE / 2.5, TextAlign.Right);
		if (DEBUG) ctx.fillText(`rawSpeed: ${this.rawSpeed.toFixed(2)}`, this.width / 2, this.height - FONT_SIZE - MARGIN);
	}

}