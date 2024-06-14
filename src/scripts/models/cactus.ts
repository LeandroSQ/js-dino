import { StatePlay } from "./../states/state-play";
import { Sprite, SpriteSheet } from "../utils/spritesheet";
import { BASE_MOVE_SPEED, CACTUS_BIG_SPAWN_CHANCE } from "../constants";
import { AObstacle } from "../types/obstacle";
import { Rectangle } from "./rectangle";
import { Gizmo } from "../utils/gizmo";

const small = [
	SpriteSheet.smallCactus0,
	SpriteSheet.smallCactus1,
	SpriteSheet.smallCactus2,
	SpriteSheet.smallCactus3,
	SpriteSheet.smallCactus4,
	SpriteSheet.smallCactus5
] as const;

const big = [
	SpriteSheet.bigCactus0,
	SpriteSheet.bigCactus1,
	SpriteSheet.bigCactus2,
	SpriteSheet.bigCactus3,
	SpriteSheet.bigCactus4
] as const;

export class Cactus extends AObstacle {

	public sprite: Sprite;
	public isBig: boolean;

	constructor(private state: StatePlay) {
		super();

		this.isBig = Math.random() < CACTUS_BIG_SPAWN_CHANCE;
		const source = this.isBig ? big : small;
		this.sprite = source[Math.floor(Math.random() * source.length)];

		this.velocity.x = BASE_MOVE_SPEED;
		this.position.x = this.state.width + this.sprite.width;
		this.position.y = this.state.height - SpriteSheet.ground.height - this.sprite.height + SpriteSheet.groundOffset;
	}

	public get bounds(): Rectangle {
		return new Rectangle(this.position.x, this.position.y, this.sprite.width, this.sprite.height);
	}

	public get isOutOfScreen(): boolean {
		return this.position.x + this.sprite.width < 0;
	}

	public update(deltaTime: number): void {
		this.position.x -= this.velocity.x * this.state.speed * deltaTime;
	}

	public render(ctx: CanvasRenderingContext2D): void {
		ctx.drawSprite(this.sprite, this.position.x, this.position.y);

		Gizmo.outline(this.bounds, "green");
	}

}