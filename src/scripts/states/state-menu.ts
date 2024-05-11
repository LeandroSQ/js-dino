/* eslint-disable max-statements */
import { DensityCanvas } from "../components/density-canvas";
import { InputHandler, MouseButton } from "../components/input-handler";
import { BLOCK_GAP, BLOCK_HEIGHT, BLOCK_WIDTH, FONT_FAMILY, FONT_SIZE, PADDLE_HEIGHT, PADDLE_MARGIN, PADDLE_WIDTH } from "../constants";
import { Main } from "../main";
import { Ball } from "../models/ball";
import { Block } from "../models/block";
import { COMPaddle } from "../models/com-paddle";
import { Paddle } from "../models/paddle";
import { Rectangle } from "../models/rectangle";
import { Vector } from "../models/vector";
import { Color } from "../utils/color";
import { Theme } from "../utils/theme";
import { IState } from "./state";
import { StatePlay } from "./state-play";

export class StateMenu implements IState {

	private ball: Ball;
	private paddle: Paddle;
	private blocks: Array<Block> = [];

	private dimTimer = 0;

	private blockBuffer = new DensityCanvas("block-buffer");
	private isBlockBufferDirty = true;

	constructor(private main: Main) { }

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

	private generateBlocks() {
		this.blocks = [];
		const columns = Math.floor((this.width - BLOCK_GAP * 2 - BLOCK_WIDTH * 2) / (BLOCK_WIDTH + BLOCK_GAP));
		const rows = Math.floor((this.height / 2 - BLOCK_GAP * 2 - BLOCK_HEIGHT) / (BLOCK_HEIGHT + BLOCK_GAP));

		const offset = new Vector(
			this.width / 2 - (columns * (BLOCK_WIDTH + BLOCK_GAP)) / 2 + BLOCK_GAP / 2,
			this.height / 2 - (rows * (BLOCK_HEIGHT + BLOCK_GAP))
		);
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < columns; col++) {
				const position = new Vector(
					col * (BLOCK_WIDTH + BLOCK_GAP),
					row * (BLOCK_HEIGHT + BLOCK_GAP)
				).add(offset);
				const color = `oklch(from hsl(${row / rows * 100} 50% 50%) l c h)`;

				this.blocks.push(new Block(col, row, new Rectangle(position.x, position.y, BLOCK_WIDTH, BLOCK_HEIGHT), color));
			}
		}
	}
	// #endregion

	async setup() {
		this.ball = new Ball(this.main.canvas);
		this.paddle = new COMPaddle({ x: this.width / 2 - PADDLE_WIDTH / 2, y: this.height - PADDLE_HEIGHT - PADDLE_MARGIN }, this.ball);
		this.generateBlocks();
		this.blockBuffer.setSize(this.width, this.height);
	}

	async update(deltaTime: number) {
		const substeps = 8;
		const subDeltaTime = deltaTime / substeps;
		const lastBlockCount = this.blocks.length;
		for (let i = 0; i < substeps; i++) {
			this.ball.update(subDeltaTime, this.main.canvas, this.paddle, this.blocks);
			this.paddle.update(subDeltaTime, this.main.canvas);
		}

		if (this.blocks.length !== lastBlockCount) {
			if (this.blocks.length === 0) {
				this.resize();
			} else {
				this.isBlockBufferDirty = true;
			}
		}

		if (this.dimTimer >= 1.0) {
			this.dimTimer = 1.0;
		} else {
			this.dimTimer += deltaTime;
		}

		this.invalidate();

		if (InputHandler.isMouseButtonDown(MouseButton.Left)) {
			this.main.setState(new StatePlay(this.main));
		}
	}

	resize() {
		if (this.paddle) {
			this.paddle.bounds.x = Math.clamp(this.paddle.bounds.x, 0, this.width - PADDLE_WIDTH);
			this.paddle.bounds.y = this.height - PADDLE_HEIGHT - PADDLE_MARGIN;
		}

		if (this.ball) this.ball.reset(this.main.canvas);

		if (this.blocks) this.generateBlocks();

		this.blockBuffer.setSize(this.width, this.height);
		this.isBlockBufferDirty = true;
	}

	render(ctx: CanvasRenderingContext2D) {
		if (this.isBlockBufferDirty) {
			this.blockBuffer.clear();
			this.blocks.forEach(x => x.render(this.blockBuffer.context));
			this.isBlockBufferDirty = false;
		}

		this.main.canvas.clear();

		ctx.save();
		let timer = Math.pow( this.dimTimer, 4.0);
		const dimAmount = Theme.isDark ? 0.15 : 0.25;
		ctx.globalAlpha = dimAmount * timer;
		ctx.filter = `blur(${timer.toFixed(1)}px)`;
		this.blockBuffer.drawTo(0, 0, ctx);
		this.paddle.render(ctx);
		this.ball.render(ctx);
		ctx.restore();

		ctx.save();
		ctx.globalAlpha = Math.pow(this.dimTimer, 2.0);
		ctx.font = `${FONT_SIZE}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Theme.foreground;
		ctx.shadowColor = Theme.containerShadow;
		ctx.shadowBlur = 10 * timer;
		ctx.shadowOffsetY = 2.5;
		ctx.fillTextCentered("Breakout", this.width / 2, this.height / 2 - FONT_SIZE);
		ctx.font = `${FONT_SIZE / 2}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Color.alpha(Theme.foreground, Math.oscilate(Date.now() / 1000.0, 0.5, 0.25, 1.0));
		ctx.fillTextCentered("Click to start", this.width / 2, this.height / 2);
		ctx.restore();
	}

}