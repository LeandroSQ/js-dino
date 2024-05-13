import { BLOCK_HEIGHT, BLOCK_WIDTH } from "../constants";
import { Rectangle } from "./rectangle";

export class Block {

	public bounds: Rectangle;

	constructor(
		x: number,
		y: number,
		public color: string
	) {
		this.bounds = new Rectangle(x, y, BLOCK_WIDTH, BLOCK_HEIGHT);
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
	}

}