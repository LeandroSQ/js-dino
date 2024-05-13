/* eslint-disable max-statements */
import { InputHandler, MouseButton } from "../components/input-handler";
import { FONT_SIZE, FONT_FAMILY } from "../constants";
import { Main } from "../main";
import { Color } from "../utils/color";
import { Cursor } from "../utils/cursor";
import { CursorType } from "../types/cursor-type";
import { Theme } from "../utils/theme";
import { AState } from "./state";
import { StatePlay } from "./state-play";

export class StateGameOver extends AState {

	private dimTimer = 0;

	constructor(private main: Main) {
		super();
	}

	// #region Utility

	public get width() {
		return this.main.canvas.width;
	}

	public get height() {
		return this.main.canvas.height;
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
		if (InputHandler.isMouseButtonDown(MouseButton.Left)) {
			this.main.setState(new StatePlay(this.main));
		}

		this.invalidate();
	}

	preRender(ctx: CanvasRenderingContext2D): void {
		const timer = Math.pow(1.0 - this.dimTimer, 4.0);
		const dimAmount = Theme.isDark ? 0.15 : 0.25;

		ctx.globalAlpha = dimAmount + (timer * (1.0 - dimAmount));
		ctx.filter = `blur(${timer.toFixed(1)}px)`;
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.globalAlpha = Math.pow(this.dimTimer, 2.0);
		ctx.font = `${FONT_SIZE}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Theme.foreground;
		ctx.shadowColor = Theme.containerShadow;
		ctx.shadowBlur = 10 * Math.pow(1.0 - this.dimTimer, 4.0);
		ctx.shadowOffsetY = 2.5;
		ctx.fillTextCentered("Game over!", this.width / 2, this.height / 2 - FONT_SIZE);
		ctx.font = `${FONT_SIZE / 2}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Color.alpha(Theme.foreground, Math.oscilate(Date.now() / 1000.0, 0.5, 0.25, 1.0));
		ctx.fillTextCentered("Click to restart", this.width / 2, this.height / 2);
		ctx.restore();
	}

}