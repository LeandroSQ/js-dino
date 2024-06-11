import { CLOUD_MAX_MOVE_SPEED, CLOUD_MIN_MOVE_SPEED } from "../constants";
import { Main } from "../main";
import { AEntity } from "../types/entity";
import { SpriteSheet } from "../utils/spritesheet";
import { Vector } from "./vector";

export class Cloud extends AEntity {

	constructor(public position: Vector, private main: Main) {
		super();

		this.reset();
	}

	private reset() {
		this.velocity.x = Math.random() * (CLOUD_MAX_MOVE_SPEED - CLOUD_MIN_MOVE_SPEED) + CLOUD_MIN_MOVE_SPEED;
	}

	public update(deltaTime: number): void {
		this.position.x += this.velocity.x * deltaTime;

		if (this.position.x < -SpriteSheet.cloud.width) {
			this.reset();
			this.position.x = this.main.screen.width + SpriteSheet.cloud.width;
			this.position.y = Math.random() * this.main.screen.height / 2;
		}
	}

	public render(ctx: CanvasRenderingContext2D): void {
		ctx.drawSprite(SpriteSheet.cloud, this.position.x, this.position.y);
	}

}