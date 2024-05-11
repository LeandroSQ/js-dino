import { Theme } from "../utils/theme";
import { Rectangle } from "./rectangle";

export class Block {

	constructor(
		public column: number,
		public row: number,
		public bounds: Rectangle,
		public color: string
	) { }

	render(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
	}

}