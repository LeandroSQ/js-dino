/* eslint-disable max-statements */
import { FONT_SIZE, FONT_FAMILY } from "../constants";
import { Main } from "../main";
import { Color } from "../utils/color";
import { Cursor } from "../utils/cursor";
import { CursorType } from "../types/cursor-type";
import { Theme } from "../utils/theme";
import { StatePlay } from "./state-play";
import { Dinosaur } from "../models/dinosaur";
import { Ground } from "../models/ground";
import { AObstacle } from "../types/obstacle";
import { AState } from "../types/state";
import { InputHandler } from "../components/input-handler";
import { SpriteSheet } from "../utils/spritesheet";
import { TextAlign } from "../types/text-align";
import { Leaderboard } from "../utils/leaderboard";
import { Vector } from "../models/vector";

export class StateGameOver extends AState {

	private dimTimer = 0;
	private dinoPosition: Vector;

	constructor(
		private ground: Ground,
		dino: Dinosaur,
		private obstacles: AObstacle[],
		private score: string,
		private main: Main
	) {
		super();

		this.dinoPosition = dino.position.clone();
	}

	// #region Utility

	public get width() {
		return this.main.screen.width;
	}

	public get height() {
		return this.main.screen.height;
	}

	public invalidate() {
		this.main.invalidate();
	}
	// #endregion

	async setup() {
		Cursor.set(CursorType.Pointer);
	}

	async update(deltaTime: number) {
		if (this.dimTimer >= 1.0) {
			this.dimTimer = 1.0;
		} else {
			this.dimTimer += deltaTime;
		}

		// Restart game on click
		if (InputHandler.isDirty) {
			this.main.setState(new StatePlay(this.main));
		}

		this.invalidate();
	}

	render(ctx: CanvasRenderingContext2D) {
		this.ground.render(ctx);
		this.obstacles.forEach(x => x.render(ctx));

		// Dino
		ctx.drawSprite(SpriteSheet.dino4, this.dinoPosition.x, this.dinoPosition.y);

		ctx.save();
		ctx.globalAlpha = Math.pow(this.dimTimer, 2.0);
		ctx.shadowColor = Theme.containerShadow;
		ctx.shadowBlur = 10 * Math.pow(this.dimTimer, 4.0);
		ctx.shadowOffsetY = 2.5;

		// Title
		ctx.textBaseline = "top";
		ctx.font = `${FONT_SIZE}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Theme.foreground;
		ctx.fillTextAligned("GAME OVER", this.width / 2, this.height / 2 - FONT_SIZE * 2.5, TextAlign.Center);

		// Subtitle
		ctx.font = `${FONT_SIZE / 2}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Color.alpha(Theme.foreground, Math.pow(Math.oscilate(this.main.globalTimer, 0.5, 0.25, 0.75), 2.0));
		ctx.fillTextAligned("Press to restart", this.width / 2, this.height / 2 - FONT_SIZE, TextAlign.Center);

		// Restart Button
		const w = SpriteSheet.resetButton.width / 2;
		const h = SpriteSheet.resetButton.height / 2;
		ctx.drawSprite(SpriteSheet.resetButton, this.width / 2 - w / 2, this.height / 1.75, w, h);

		// Score
		ctx.font = `${FONT_SIZE / 3}pt ${FONT_FAMILY}`;
		if (Leaderboard.isCurrentHighest) {
			ctx.fillStyle = Color.alpha(Theme.foreground, Math.pow(Math.oscilate(this.main.globalTimer, 0.25, 0.75, 1.0), 2.0));
			ctx.fillTextAligned(`New high score: ${this.score}`, this.width / 2, this.height / 1.75 + FONT_SIZE, TextAlign.Center);
		} else {
			ctx.fillStyle = Theme.foreground;
			ctx.fillTextAligned(`Score: ${this.score}`, this.width / 2, this.height / 1.75 + FONT_SIZE, TextAlign.Center);
		}

		ctx.restore();
	}

}