import { PADDLE_MAX_SPEED, PADDLE_SPEED } from "../constants";
import { Size } from "../types/size";
import { Ball } from "./ball";
import { Paddle } from "./paddle";
import SETTINGS from "../settings";
import { Gizmo } from "../utils/gizmo";
import { Vector } from "./vector";

export class COMPaddle extends Paddle {


	constructor(position, private ball: Ball) {
		super(position);
	}

	private moveTo(deltaTime: number, screen: Size, target: number, speedMultiplier = 1.0) {
		const speed = deltaTime * PADDLE_SPEED * SETTINGS.DIFFICULTY * speedMultiplier;
		this.bounds.x = Math.clamp(Math.lerp(this.bounds.x, target, speed), 0, screen.width - this.bounds.width);
	}

	private moveToCenter(deltaTime: number, screen: Size) {
		const target = screen.width / 2 - this.bounds.width / 2;
		this.moveTo(deltaTime, screen, target);
	}

	private chaseBall(deltaTime: number, screen: Size) {
		const target = this.ball.bounds.x;
		const maxPossibleDistance = Math.abs(screen.width - this.bounds.width);

		const distance = Math.abs(this.bounds.x - this.ball.bounds.x) / maxPossibleDistance;
		this.moveTo(deltaTime, screen, target, distance);
	}

	private predictBallTrajectory(deltaTime: number, screen: Size) {
		// Predict the time it will take for the ball to reach the paddle
		const predictedY = this.ball.bounds.y + this.ball.bounds.height;
		const time = (this.bounds.y - predictedY) / this.ball.velocity.y;
		let predictedX = this.ball.bounds.x + this.ball.velocity.x * time;

		// The ball will bounce, so we need to calculate the new predicted position
		for (let count = 0; (predictedX < 0 || predictedX + this.ball.bounds.width > screen.width) && count < 10; count++) {
			if (predictedX < 0) {
				Gizmo.circle(new Vector(predictedX + this.ball.bounds.width, predictedY - this.ball.bounds.height / 2), this.ball.bounds.height / 2, "rgba(255, 0, 0, 0.25)");
				predictedX = -predictedX;
			}
			if (predictedX + this.ball.bounds.width > screen.width) {
				Gizmo.circle(new Vector(screen.width - this.ball.bounds.width, predictedY - this.ball.bounds.height / 2), this.ball.bounds.height / 2, "rgba(255, 0, 0, 0.25)");
				predictedX = screen.width - this.ball.bounds.width - (predictedX - screen.width + this.ball.bounds.width);
			}
		}

		const target = predictedX - this.bounds.width / 2;
		this.moveTo(deltaTime, screen, target);

		Gizmo.circle(this.bounds.center, 5, "red");
		Gizmo.circle(new Vector(predictedX, predictedY), 5, "green");
		Gizmo.line(this.ball.bounds.center, new Vector(predictedX, this.bounds.y), "green"); 
	}

	public update(deltaTime: number, screen: Size) {
		if (this.ball.timer > 0) {
			this.moveToCenter(deltaTime, screen);
		} else if (this.ball.bounds.y < screen.height / 3 || this.ball.velocity.y < 0) {
			this.chaseBall(deltaTime, screen);
		} else {
			this.predictBallTrajectory(deltaTime, screen);
		}
	}


}