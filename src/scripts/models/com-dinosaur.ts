import { DINO_GRAVITY, DINO_JUMP_FORCE, DINO_JUMP_FORCE } from "../constants";
import { Gizmo } from "../utils/gizmo";
import { Dinosaur } from "./dinosaur";
import { Vector } from "./vector";

export class COMDinosaur extends Dinosaur {

	override updateInput(deltaTime: number) {

		// Position
		// P0 = V0 * t + A * t^2 / 2
		// Given that, knowing the current velocity and acceleration
		// Calculate the peak height of the jump

		const force = DINO_JUMP_FORCE;// Usually divided by delta time
		const gravity = DINO_GRAVITY;
		const initialPos = this.groundHeight + this.sprite.height;
		const initialVel = 0;
		const time = initialVel / gravity;
		const jumpHeight = initialPos + initialVel * time + gravity * time ** 2 / 2;

		// console.log(jumpHeight);
		Gizmo.line(
			new Vector(this.position.x, initialPos - jumpHeight),
			new Vector(this.position.x + this.sprite.width, initialPos - jumpHeight),
		);
		// Gizmo.text(jumpHeight.toFixed(2), this.position.subtract(new Vector(0, 10)));

		// Gizmo.circle(new Vector(this.position.x + this.sprite.width / 2, this.groundHeight + this.sprite.height), 20);

		this.jump(deltaTime);

		const obstacle = this.state.obstacles.find(x => x);
		if (!obstacle) return;

		const distance = obstacle.position.x - (this.position.x + this.sprite.width);
	}

}