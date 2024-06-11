import { BASE_MOVE_SPEED } from "../constants";
import { StatePlay } from "../states/state-play";
import { AObstacle } from "../types/obstacle";
import { Gizmo } from "../utils/gizmo";
import { Sprite, SpriteSheet } from "../utils/spritesheet";
import { Rectangle } from "./rectangle";

export class Pterodactyl extends AObstacle {

	constructor(private state: StatePlay) {
		super();

		this.velocity.x = BASE_MOVE_SPEED;
		this.position.x = this.state.width + this.sprite.width;
		this.position.y = this.state.height - SpriteSheet.ground.height - SpriteSheet.dinoIdle.height - this.sprite.height / 2;
	}

	public get sprite(): Sprite {
		return this.state.main.globalTimer % 0.5 > 0.25 ? SpriteSheet.pterodactyl0 : SpriteSheet.pterodactyl1;
	}

	public get isOutOfScreen(): boolean {
		return this.position.x + this.sprite.width < 0;
	}

	public get bounds(): Rectangle {
		return new Rectangle(this.position.x, this.position.y, this.sprite.width, this.sprite.height);
	}

	public update(deltaTime: number): void {
		this.position.x -= this.velocity.x * this.state.speed * deltaTime;
	}

	public render(ctx: CanvasRenderingContext2D): void {
		ctx.drawSprite(this.sprite, this.position.x, this.position.y);

		Gizmo.outline(this.bounds, "yellow");
	}

}