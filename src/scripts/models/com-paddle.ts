/* eslint-disable max-statements */
import { BALL_RADIUS, BALL_SPEED, PADDLE_ACCELERATION, PADDLE_MAX_SPEED } from "../constants";
import { APaddle } from "./paddle";
import SETTINGS from "../settings";
import { Gizmo } from "../utils/gizmo";
import { Vector } from "./vector";
import { Main } from "../main";
import { Ray } from "./ray";

export class COMPaddle extends APaddle {

	private velocity = 0;
	private acceleration = 0;

	constructor(private main: Main) {
		super(main.canvas.size);
	}

	private moveTo(deltaTime: number, target: number, speedMultiplier = 1.0) {
		/* const speed = deltaTime * PADDLE_SPEED * SETTINGS.DIFFICULTY * speedMultiplier;
		this.bounds.x = Math.clamp(Math.lerp(this.bounds.x, target, speed), 0, this.main.canvas.width - this.bounds.width); */

		// With acceleration
		const distance = target - this.bounds.x;
		const maxSpeed = PADDLE_ACCELERATION * SETTINGS.DIFFICULTY * speedMultiplier;
		this.acceleration += distance * maxSpeed;

		// Add penalty for changing direction or starting to move
		if (Math.sign(this.velocity) !== Math.sign(this.acceleration) || Math.abs(this.velocity) <= Number.EPSILON) {
			this.acceleration *= 0.15 * deltaTime;
		}
	}

	private moveToCenter(deltaTime: number) {
		Gizmo.text("moveToCenter", this.bounds.center.add(new Vector(0, -20)), "red", "center")
		const target = this.main.canvas.width / 2 - this.bounds.width / 2;
		this.moveTo(deltaTime, target);
	}

	private chaseBall(deltaTime: number) {
		Gizmo.text("chaseBall", this.bounds.center.add(new Vector(0, -20)), "red", "center")
		const target = this.main.ball.bounds.x;
		const maxPossibleDistance = Math.abs(this.main.canvas.width - this.bounds.width);

		const distance = Math.abs(this.bounds.x - this.main.ball.bounds.x) / maxPossibleDistance;
		this.moveTo(deltaTime, target, distance);
	}

	private isThereAnyBlockBetweenPaddleAndBall() {
		const ray = new Ray(this.bounds.center, this.main.ball.bounds.center.add(this.main.ball.velocity.multiply(0.25)));
		for (const block of this.main.blocks) {
			// Check if there is any block between the paddle and the ball
			if (ray.intersects(block.bounds)) {
				return true;
			}
		}

		return false;
	}

	private predictBallTrajectory(deltaTime: number) {
		Gizmo.text("predictBallTrajectory", this.bounds.center.add(new Vector(0, -20)), "red", "center");

		const predictY = this.main.ball.bounds.y - BALL_RADIUS;
		const timeToReach = Math.abs(this.bounds.y - predictY) / (BALL_SPEED * SETTINGS.DIFFICULTY);
		let estimatedX = this.main.ball.bounds.x + this.main.ball.velocity.x * timeToReach;

		// Check if the ball is going to hit the wall
		if (estimatedX < 0) {
			estimatedX = Math.abs(estimatedX);
		} else if (estimatedX > this.main.canvas.width - this.main.ball.bounds.width) {
			Gizmo.line(this.main.ball.bounds.center, new Vector(estimatedX, this.bounds.y), "magenta");
			estimatedX = this.main.canvas.width - this.main.ball.bounds.width - (estimatedX - (this.main.canvas.width - this.main.ball.bounds.width));
		}


		Gizmo.line(this.main.ball.bounds.center, new Vector(estimatedX, this.bounds.y), "magenta");

		estimatedX -= this.bounds.width / 2;

		Gizmo.circle(new Vector(estimatedX, this.bounds.y), 15, "cyan");

		this.moveTo(deltaTime, estimatedX);

	}

	public update(deltaTime: number) {
		this.velocity += this.acceleration * 0.5 * deltaTime;
		if (Math.abs(this.velocity) > PADDLE_MAX_SPEED) this.velocity = PADDLE_MAX_SPEED * Math.sign(this.velocity);
		this.bounds.x += this.velocity * deltaTime;
		this.velocity += this.acceleration * 0.5 * deltaTime;
		this.velocity *= 0.9;
		this.acceleration = 0;
		if (this.main.isInPreparationTime) {
			this.moveToCenter(deltaTime);
		} else {
			// if (this.isThereAnyBlockBetweenPaddleAndBall())
				// this.chaseBall(deltaTime);
			// else
				this.predictBallTrajectory(deltaTime);
		}
	}


}