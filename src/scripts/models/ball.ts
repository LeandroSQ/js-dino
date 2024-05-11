import { AUDIO_DURATION, AUDIO_BOUNCE_HZ, AUDIO_SCORE_HZ, AUDIO_TIMER_HZ, BALL_RADIUS, BALL_SPEED, BALL_TIMER, BLOCK_GAP } from "../constants";
import SETTINGS from "../settings";
import { Rectangle } from "./rectangle";
import { Vector } from "./vector";
import { Size } from "./../types/size";
import { Paddle } from "./paddle";
import { AudioSynth } from "../utils/audio";
import { Theme } from "../utils/theme";
import { Block } from "./block";
import { Color } from "../utils/color";

export class Ball {

	public bounds = new Rectangle(0, 0, BALL_RADIUS * 2, BALL_RADIUS * 2);
	public velocity = new Vector(0, 0);
	public timer = BALL_TIMER;
	public lives = 3;// This could be better placed on the game state too
	private lastTimer = 0;
	private audioPitch = 0;
	private timeSinceLastHit = 0;

	constructor(screen: Size) {
		this.bounds.position = Vector.zero;
		this.velocity = Vector.zero;
		this.reset(screen);
	}

	public reset(screen: Size) {
		this.timer = BALL_TIMER;
		this.bounds.x = screen.width / 2 - this.bounds.width / 2;
		this.bounds.y = screen.height / 2 - this.bounds.height / 2 + BLOCK_GAP * 2;
		this.lives = 3;
		SETTINGS.DIFFICULTY = 1.0;
	}

	private playSound(hertz: number) {
		AudioSynth.play(hertz, AUDIO_DURATION * (1.0 + Math.random() * 0.8 - 0.4));
	}

	private bounceOffWalls(screen: Size) {
		// Bounce off screen edges
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
			this.bounds.y = screen.height - this.bounds.height;
			this.velocity.y *= -1;
			const currentLives = this.lives;
			this.reset(screen);
			this.lives = currentLives - 1;
			this.playSound(AUDIO_BOUNCE_HZ);
		}
	}

	private bounceOffBlocks(blocks: Array<Block>, screen: Size) {
		// Bounce off blocks
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

				this.timeSinceLastHit = performance.now();
				this.audioPitch += 0.25;
				const pan = Math.min(1, Math.max(-1, (this.bounds.center.x - screen.width / 2) / (screen.width / 2)));
				AudioSynth.play(AUDIO_SCORE_HZ * (1.0 + this.audioPitch), AUDIO_DURATION * (1.0 + Math.random() * 0.8 - 0.4), pan);
				blocks.splice(i, 1);
				SETTINGS.DIFFICULTY *= 1.01;
			}
		}

		if (performance.now() - this.timeSinceLastHit > 500) {
			this.audioPitch = 0;
		}

	}

	private bounceOffPaddle(paddle: Paddle) {
		if (this.bounds.intersects(paddle.bounds)) {
			const isBallMovingTowardsPaddle = this.velocity.y > 0;
			if (isBallMovingTowardsPaddle) {
				this.velocity.y *= -1;
				this.playSound(AUDIO_BOUNCE_HZ);
				SETTINGS.DIFFICULTY *= 1.01;
			}
		}
	}

	private updateTimer(deltaTime: number) {
		this.timer -= deltaTime;
		if (this.timer <= 0) {
			this.velocity = new Vector(
				Math.random() < 0.5 ? -BALL_SPEED : BALL_SPEED,
				BALL_SPEED
			);
		}

		// Play sound countdown
		if (Math.floor(this.timer) !== this.lastTimer) {
			this.lastTimer = Math.floor(this.timer);
			this.playSound(AUDIO_TIMER_HZ * (BALL_TIMER - this.timer + 1));
		}
	}

	public update(deltaTime: number, screen: Size, paddle: Paddle, blocks: Array<Block>) {
		if (this.timer > 0) {
			this.updateTimer(deltaTime);

			return;
		}

		// Update velocity
		this.bounds.x += this.velocity.x * SETTINGS.DIFFICULTY * deltaTime;
		this.bounds.y += this.velocity.y * SETTINGS.DIFFICULTY * deltaTime;

		this.bounceOffWalls(screen);
		this.bounceOffPaddle(paddle);
		this.bounceOffBlocks(blocks, screen);
	}

	public render(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		if (this.timer > 0) ctx.fillStyle = Color.alpha(Theme.foreground, Math.sin(this.timer * (Math.PI * 2) * 1.20) * 0.25 + 0.75);
		else ctx.fillStyle = Theme.foreground;

		ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
	}

}