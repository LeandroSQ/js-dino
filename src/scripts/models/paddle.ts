import { PADDLE_HEIGHT, PADDLE_MARGIN, PADDLE_WIDTH } from "./../constants";
import { Vector } from "./vector";
import { Theme } from "../utils/theme";
import { Rectangle } from "./rectangle";
import { Size } from "../types/size";

export abstract class APaddle {

	public bounds = new Rectangle(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
	public score = 0;

	constructor(screen: Size) {
		this.bounds.position = new Vector(
			screen.width / 2 - PADDLE_WIDTH / 2,
			screen.height - PADDLE_HEIGHT - PADDLE_MARGIN
		);
	}

	public abstract update(deltaTime: number);

	public render(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = Theme.foreground;
		ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
	}

}