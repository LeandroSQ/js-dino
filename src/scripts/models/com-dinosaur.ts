import { InputHandler } from "../components/input-handler";
import { DINO_GRAVITY, DINO_JUMP_FORCE, DINO_LONG_JUMP_SCALE, DINO_REGULAR_JUMP_SCALE, MARGIN, MOBILE_SPEED_FACTOR } from "../constants";
import { Gizmo } from "../utils/gizmo";
import { SpriteSheet } from "../utils/spritesheet";
import { Cactus } from "./cactus";
import { Dinosaur } from "./dinosaur";
import { Pterodactyl } from "./pterodactyl";
import { Vector } from "./vector";

export class COMDinosaur extends Dinosaur {

	private isJumping = false;
	private jumpTimer = 0;
	private jumpTimeSum = 0.68;
	private jumpTimeCount = 1;

	private enabled = false;

	private get jumpDuration() {
		return this.jumpTimeSum / this.jumpTimeCount;
	}

	private updateJumpResponse() {
		const obstacle = this.state.obstacles.find(x => x);
		if (!obstacle) return;

		this.isCrouching = false;

		const distance = obstacle.position.x - (this.position.x + this.sprite.width);
		const timeToReach = distance / (obstacle.velocity.x * this.state.speed);

		const jumpHalfDuration = this.jumpDuration / 2;
		const progress = Math.clamp(timeToReach - jumpHalfDuration, 0.0, 1.0);
		const point = this.position.add(new Vector(this.sprite.width, this.sprite.height / 2)).add(
			obstacle.position.add(new Vector(0, obstacle.sprite.height / 2)).subtract(
				this.position.add(new Vector(this.sprite.width, this.sprite.height / 2))
			).multiply(progress));
		Gizmo.line(
			this.position.add(new Vector(this.sprite.width, this.sprite.height / 2)),
			point,
			"red"
		);

		if (timeToReach <= jumpHalfDuration || obstacle.position.x < this.position.x + this.sprite.width) {
			if (obstacle instanceof Cactus && distance > 0) {
				if ((obstacle as Cactus).isBig) {
					const scalar = DINO_REGULAR_JUMP_SCALE + (DINO_LONG_JUMP_SCALE - DINO_REGULAR_JUMP_SCALE) * obstacle.sprite.width / SpriteSheet.bigCactus4.width;
					this.jump(scalar);
				} else {
					this.jump(DINO_REGULAR_JUMP_SCALE);
				}
			} else if (obstacle instanceof Pterodactyl) {
				if (this.isGrounded) {
					this.isCrouching = true;
					this.position.y = this.groundHeight;
				} else {
					this.isCrouching = false;
				}
			}
		} else {
			this.isCrouching = (!this.isGrounded);
		}
	}

	override updateInput() {
		super.updateInput();

		if (InputHandler.isTogglingAI()) this.enabled = !this.enabled;
		if (!this.enabled) return;

		this.updateJumpResponse();
	}

	protected jump(scalar?: number): void {
		super.jump(scalar);

		if (this.isGrounded) {
			this.isJumping = true;
			this.jumpTimer = 0;
		}
	}

	public update(deltaTime: number): void {
		super.update(deltaTime);

		if (this.isGrounded) {
			if (this.isJumping) {
				this.isJumping = false;
				this.jumpTimeSum += this.jumpTimer;
				this.jumpTimeCount++;
			}
		} else if (this.isJumping) {
			this.jumpTimer += deltaTime;
		}

		Gizmo.text(`JT: ${this.jumpTimer}`, new Vector(this.state.width / 2, this.state.height / 2 + 50), "white", "center");
	}

}