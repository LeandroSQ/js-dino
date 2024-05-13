import { BALL_SPEED, PADDLE_SPEED } from "../constants";
import { APaddle } from "./paddle";
import SETTINGS from "../settings";
import { Gizmo } from "../utils/gizmo";
import { Vector } from "./vector";
import { Main } from "../main";

export class COMPaddle extends APaddle {

	constructor(private main: Main) {
		super(main.canvas.size);
	}

	private moveTo(deltaTime: number, target: number, speedMultiplier = 1.0) {
		const speed = deltaTime * PADDLE_SPEED * SETTINGS.DIFFICULTY * speedMultiplier;
		this.bounds.x = Math.clamp(Math.lerp(this.bounds.x, target, speed), 0, this.main.canvas.width - this.bounds.width);
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

	private predictBallTrajectory(deltaTime: number) {
		Gizmo.text("predictBallTrajectory", this.bounds.center.add(new Vector(0, -20)), "red", "center");
		// Predict the time it will take for the ball to reach the paddle
		const predictedY = this.main.ball.bounds.y + this.main.ball.bounds.height;
		const time = (this.bounds.y - predictedY) / BALL_SPEED;
		let predictedX = this.main.ball.bounds.x + this.main.ball.velocity.x * time;

		// The ball will bounce, so we need to calculate the new predicted position
		for (let count = 0; (predictedX < 0 || predictedX + this.main.ball.bounds.width > this.main.canvas.width) && count < 10; count++) {
			if (predictedX < 0) {
				Gizmo.circle(new Vector(predictedX + this.main.ball.bounds.width, predictedY - this.main.ball.bounds.height / 2), this.main.ball.bounds.height / 2, "rgba(255, 0, 0, 0.25)");
				predictedX = -predictedX;
			}
			if (predictedX + this.main.ball.bounds.width > this.main.canvas.width) {
				Gizmo.circle(new Vector(this.main.canvas.width - this.main.ball.bounds.width, predictedY - this.main.ball.bounds.height / 2), this.main.ball.bounds.height / 2, "rgba(255, 0, 0, 0.25)");
				predictedX = this.main.canvas.width - this.main.ball.bounds.width - (predictedX - this.main.canvas.width + this.main.ball.bounds.width);
			}
		}

		const target = predictedX - this.bounds.width / 2;
		this.moveTo(deltaTime, target);

		Gizmo.circle(this.bounds.center, 5, "red");
		Gizmo.circle(new Vector(predictedX, predictedY), 5, "green");
		Gizmo.line(this.main.ball.bounds.center, new Vector(predictedX, this.bounds.y), "green");
	}

	public update(deltaTime: number) {
		if (this.main.isInPreparationTime) {
			this.moveToCenter(deltaTime);
		} else if (this.main.ball.bounds.y < this.main.canvas.height / 3 || this.main.ball.velocity.y < 0) {
			this.chaseBall(deltaTime);
		} else {
			this.predictBallTrajectory(deltaTime);
		}
	}


}