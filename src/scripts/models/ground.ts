import { BASE_MOVE_SPEED } from "../constants";
import { StatePlay } from "../states/state-play";
import { AEntity } from "../types/entity";
import { SpriteSheet } from "../utils/spritesheet";

export class Ground extends AEntity {

	constructor(private state: StatePlay) {
		super();

		this.velocity.x = BASE_MOVE_SPEED;
	}

	public update(deltaTime: number): void {
		this.position.x += this.velocity.x * this.state.speed * deltaTime;
		if (this.position.x >= SpriteSheet.ground.width) this.position.x -= SpriteSheet.ground.width;
	}

	public render(ctx: CanvasRenderingContext2D): void {
		ctx.drawImage(
			SpriteSheet.source,
			SpriteSheet.ground.x + this.position.x,
			SpriteSheet.ground.y,
			this.state.width,
			SpriteSheet.ground.height,
			0, this.state.height - SpriteSheet.ground.height,
			this.state.width, SpriteSheet.ground.height
		);

		// Loop the ground texture, if necessary
		if (this.position.x + this.state.width > SpriteSheet.ground.width) {
			ctx.drawImage(
				SpriteSheet.source,
				SpriteSheet.ground.x,
				SpriteSheet.ground.y,
				this.position.x + this.state.width - SpriteSheet.ground.width,
				SpriteSheet.ground.height,
				SpriteSheet.ground.width - this.position.x,
				this.state.height - SpriteSheet.ground.height,
				this.position.x + this.state.width - SpriteSheet.ground.width,
				SpriteSheet.ground.height
			);
		}
	}

}