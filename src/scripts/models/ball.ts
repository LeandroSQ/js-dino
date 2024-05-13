import { BALL_RADIUS, BALL_SPEED, BLOCK_GAP } from "../constants";
import SETTINGS from "../settings";
import { Rectangle } from "./rectangle";
import { Vector } from "./vector";
import { Theme } from "../utils/theme";
import { Color } from "../utils/color";
import { Main } from "../main";

export class Ball {

	public bounds = new Rectangle(0, 0, BALL_RADIUS * 2, BALL_RADIUS * 2);
	public velocity = new Vector(0, 0);

	constructor(public main: Main) {
		this.bounds.position = Vector.zero;
		this.velocity = Vector.zero;
		this.reset();
	}

	public reset() {
		this.bounds.x = this.main.canvas.width / 2 - this.bounds.width / 2;
		this.bounds.y = this.main.canvas.height / 2 - this.bounds.height / 2 + BLOCK_GAP * 2;
		this.velocity = Vector.zero;
	}

	private bounceOffScreenEdges() {
		const screen = this.main.canvas.size;

		if (this.bounds.x < 0 && this.velocity.x < 0) {
			this.bounds.x = 0;
			this.velocity.x *= -1;
		} else if (this.bounds.x + this.bounds.width > screen.width && this.velocity.x > 0) {
			this.bounds.x = screen.width - this.bounds.width;
			this.velocity.x *= -1;
		}

		if (this.bounds.y < 0 && this.velocity.y < 0) {
			this.bounds.y = 0;
			this.velocity.y *= -1;
		} else if (this.bounds.y + this.bounds.height > screen.height && this.velocity.y > 0) {
			this.main.onBallBounceOffBottom();
		}
	}

	private bounceOffBlocks() {
		const blocks = this.main.blocks;

		for (let i = blocks.length - 1; i >= 0; i--) {
			const block = blocks[i];
			if (this.bounds.intersects(block.bounds)) {
				// Identify which side of the block the ball hit
				const top = Math.abs(this.bounds.bottom - block.bounds.y);
				const bottom = Math.abs(this.bounds.y - block.bounds.bottom);
				const left = Math.abs(this.bounds.right - block.bounds.x);
				const right = Math.abs(this.bounds.x - block.bounds.right);

				const min = Math.min(top, bottom, left, right);
				if (min === top || min === bottom) {
					this.velocity.y *= -1;
					this.bounds.y += min === top ? -BALL_RADIUS : BALL_RADIUS;
				} else {
					this.velocity.x *= -1;
					this.bounds.x += min === left ? -BALL_RADIUS : BALL_RADIUS;
				}

				blocks.splice(i, 1);

				this.main.onBallBounceOffBlock();
			}
		}
	}

	public accelerateToRandomDirection() {
		this.velocity = new Vector(
			Math.random() < 0.5 ? -BALL_SPEED : BALL_SPEED,
			BALL_SPEED
		);
	}

	private bounceOffPaddle() {
		if (this.bounds.intersects(this.main.paddle.bounds)) {
			const isBallMovingTowardsPaddle = this.velocity.y > 0;
			if (isBallMovingTowardsPaddle) {
				this.velocity.y *= -1;
				this.main.onBallBounceOffPaddle();
			}
		}
	}


	public update(deltaTime: number) {
		// Update velocity
		this.bounds.x += this.velocity.x * SETTINGS.DIFFICULTY * deltaTime;
		this.bounds.y += this.velocity.y * SETTINGS.DIFFICULTY * deltaTime;

		this.bounceOffScreenEdges();
		this.bounceOffPaddle();
		this.bounceOffBlocks();
	}

	public render(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();

		// Blink when in preparation time
		if (this.main.isInPreparationTime) ctx.fillStyle = Color.alpha(Theme.foreground, Math.sin(this.main.preparationTimer * (Math.PI * 2) * 1.20) * 0.25 + 0.75);
		else ctx.fillStyle = Theme.foreground;

		ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
	}

}