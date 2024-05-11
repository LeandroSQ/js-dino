import { StateWin } from "./state-win";
import { PlayerPaddle } from "./../models/player-paddle";
import { Main } from "../main";
import { IState } from "./state";
import { Ball } from "../models/ball";
import { Vector } from "../models/vector";
import { Paddle } from "../models/paddle";
import { BLOCK_GAP, BLOCK_HEIGHT, BLOCK_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN, PADDLE_WIDTH } from "../constants";
import { Log } from "../utils/log";
import { Block } from "../models/block";
import { Rectangle } from "../models/rectangle";
import { StateGameOver } from "./state-game-over";
import { InputHandler, Key } from "../components/input-handler";

export class StatePlay implements IState {

	private ball: Ball;
	private paddle: Paddle;
	private blocks: Array<Block> = [];

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
		const columns = Math.floor((this.main.canvas.width - BLOCK_GAP * 2 - BLOCK_WIDTH * 2) / (BLOCK_WIDTH + BLOCK_GAP));
		const rows = Math.floor((this.main.canvas.height / 2 - BLOCK_GAP * 2 - BLOCK_HEIGHT) / (BLOCK_HEIGHT + BLOCK_GAP));

		const offset = new Vector(
			this.main.canvas.width / 2 - (columns * (BLOCK_WIDTH + BLOCK_GAP)) / 2 + BLOCK_GAP / 2,
			this.main.canvas.height / 2 - (rows * (BLOCK_HEIGHT + BLOCK_GAP))
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
		Log.debug("StatePlay", "Setting up...");
		this.ball = new Ball(this.main.canvas);
		this.paddle = new PlayerPaddle({ x: this.main.canvas.width / 2 - PADDLE_WIDTH / 2, y: this.main.canvas.height - PADDLE_HEIGHT - PADDLE_MARGIN });
		this.generateBlocks();
	}

	async update(deltaTime: number) {
		const substeps = 8;
		const subDeltaTime = deltaTime / substeps;
		for (let i = 0; i < substeps; i++) {
			this.ball.update(subDeltaTime, this.main.canvas, this.paddle, this.blocks);
			this.paddle.update(subDeltaTime, this.main.canvas);
		}

		if (this.blocks.length === 0) {
			this.main.setState(new StateWin(this.paddle, this.ball, this.main));
		} else if (this.ball.lives <= 0) {
			this.main.setState(new StateGameOver(this.paddle, this.ball, this.blocks, this.main));
		}

		if (DEBUG) {
			if (InputHandler.isKeyDown(Key.ArrowUp))
				this.main.setState(new StateWin(this.paddle, this.ball, this.main));
			if (InputHandler.isKeyDown(Key.ArrowDown))
				this.main.setState(new StateGameOver(this.paddle, this.ball, this.blocks, this.main));
		}

		this.invalidate();
	}

	resize() {
		Log.debug("StatePlay", "Resizing...");
		if (this.paddle) {
			this.paddle.bounds.x = Math.clamp(this.paddle.bounds.x, 0, this.main.canvas.width - PADDLE_WIDTH);
			this.paddle.bounds.y = this.main.canvas.height - PADDLE_HEIGHT - PADDLE_MARGIN;
		}

		if (this.ball) this.ball.reset(this.main.canvas);

		if (this.blocks) this.generateBlocks();
	}

	render(ctx: CanvasRenderingContext2D) {
		this.main.canvas.clear();

		this.blocks.forEach(x => x.render(ctx));
		this.paddle.render(ctx);
		this.ball.render(ctx);
	}

}