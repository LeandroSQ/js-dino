import { InputHandler, MouseButton } from "../components/input-handler";
import { FONT_SIZE, FONT_FAMILY, PADDLE_HEIGHT, PADDLE_MARGIN, PADDLE_WIDTH } from "../constants";
import { Main } from "../main";
import { Ball } from "../models/ball";
import { Paddle } from "../models/paddle";
import { Color } from "../utils/color";
import { Theme } from "../utils/theme";
import { IState } from "./state";
import { StatePlay } from "./state-play";

export class StateWin implements IState {

	private dimTimer = 0;

	constructor(private paddle: Paddle, private ball: Ball, private main: Main) {  }

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
		// Ignore
	}

	async update(deltaTime: number) {
		if (this.dimTimer >= 1.0) {
			this.dimTimer = 1.0;
		} else {
			this.dimTimer += deltaTime;
		}

		this.invalidate();
	}

	resize() {
		// TODO: Save the last screen size and reposition the paddle and ball relative to the new screen size
		if (this.paddle) {
			this.paddle.bounds.x = Math.clamp(this.paddle.bounds.x, 0, this.width - PADDLE_WIDTH);
			this.paddle.bounds.y = this.height - PADDLE_HEIGHT - PADDLE_MARGIN;
		}

		if (this.ball) {
			this.ball.bounds.x = Math.clamp(this.ball.bounds.x, 0, this.width - this.ball.bounds.width);
			this.ball.bounds.y = Math.clamp(this.ball.bounds.y, 0, this.height - this.ball.bounds.height);
		}

		if (InputHandler.isMouseButtonDown(MouseButton.Left)) {
			this.main.setState(new StatePlay(this.main));
		}
	}

	render(ctx: CanvasRenderingContext2D) {
		this.main.canvas.clear();

		ctx.save();
		const timer = Math.pow(1.0 - this.dimTimer, 4.0);
		const dimAmount = Theme.isDark ? 0.15 : 0.25;
		ctx.globalAlpha = dimAmount + (timer * (1.0 - dimAmount));
		ctx.filter = "blur(5px)";
		this.paddle.render(ctx);
		this.ball.render(ctx);
		ctx.restore();

		ctx.save();
		ctx.globalAlpha = Math.pow(this.dimTimer, 2.0);
		ctx.font = `${FONT_SIZE}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Theme.foreground;
		ctx.shadowColor = Theme.containerShadow;
		ctx.shadowBlur = 10 * this.dimTimer;
		ctx.shadowOffsetY = 2.5;
		ctx.fillTextCentered("You won!", this.width / 2, this.height / 2 - FONT_SIZE);
		ctx.font = `${FONT_SIZE / 2}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Color.alpha(Theme.foreground, Math.oscilate(Date.now() / 1000.0, 0.5, 0.25, 1.0));
		ctx.fillTextCentered("Click to restart", this.width / 2, this.height / 2);
		ctx.restore();
	}

}