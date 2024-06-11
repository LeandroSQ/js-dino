/* eslint-disable max-statements */
import { Main } from "../main";
import { Cursor } from "../utils/cursor";
import { CursorType } from "../types/cursor-type";
import { InputHandler } from "../components/input-handler";
import { AState } from "../types/state";
import { Rectangle } from "../models/rectangle";
import { Sprite, SpriteSheet } from "../utils/spritesheet";

export class StateDebug extends AState {

	private imageA: Sprite = SpriteSheet.smallCactus0;
	private imageB: Sprite = SpriteSheet.dino0;
	private a: Rectangle = new Rectangle(0, 0, this.imageA.width, this.imageA.height);
	private b: Rectangle = new Rectangle(0, 0, this.imageB.width, this.imageB.height);

	private cache = document.createElement("canvas");
	private ctx = this.cache.getContext("2d");

	constructor(private main: Main) {
		super();
	}

	// #region Utility
	public get width() {
		return this.main.screen.width;
	}

	public get height() {
		return this.main.screen.height;
	}

	public invalidate() {
		this.main.invalidate();
	}
	// #endregion

	async setup() {
		this.a.x = Math.floor(this.width / 2 - this.a.width / 2);
		this.a.y = Math.floor(this.height / 2 - this.a.height / 2);

		this.b.x = Math.floor(this.width / 2 - this.b.width / 2);
		this.b.y = Math.floor(this.height / 4);
		Cursor.set(CursorType.Pointer);
	}

	async update(_deltaTime: number) {
		if (!InputHandler.isDirty) return;

		const mouse = InputHandler.mouse;
		this.a.x = Math.floor(mouse.x - this.a.width / 2);
		this.a.y = Math.floor(mouse.y - this.a.height / 2);

		this.invalidate();
	}

	private aabb(a: Rectangle, b: Rectangle): boolean {
		return (
			a.x < b.x + b.width &&
			a.x + a.width > b.x &&
			a.y < b.y + b.height &&
			a.y + a.height > b.y
		);
	}

	private getIntersection(a: Rectangle, b: Rectangle): Rectangle {
		const x = Math.floor(Math.max(a.x, b.x));
		const y = Math.floor(Math.max(a.y, b.y));
		const width = Math.ceil(Math.min(a.x + a.width, b.x + b.width) - x);
		const height = Math.ceil(Math.min(a.y + a.height, b.y + b.height) - y);

		return new Rectangle(x, y, width, height);
	}

	private pixelPerfectCollision(a: Rectangle, imageA: Sprite, b: Rectangle, imageB: Sprite, intersection: Rectangle): boolean {
		if (!this.ctx) throw new Error("Canvas context is not available");

		this.cache.width = intersection.width;
		this.cache.height = intersection.height;

		this.ctx.clearRect(0, 0, intersection.width, intersection.height);

		this.ctx.drawImage(
			SpriteSheet.source,
			imageA.x + (intersection.x - a.x),
			imageA.y + (intersection.y - a.y),
			intersection.width,
			intersection.height,
			0, 0,
			intersection.width,
			intersection.height
		);

		this.ctx.globalCompositeOperation = "source-in";

		this.ctx.drawImage(
			SpriteSheet.source,
			imageB.x + (intersection.x - b.x),
			imageB.y + (intersection.y - b.y),
			intersection.width,
			intersection.height,
			0, 0,
			intersection.width,
			intersection.height
		);

		const data = this.ctx.getImageData(0, 0, intersection.width, intersection.height);

		for (let i = 0; i < data.data.length; i += 4) {
			if (data.data[i + 3] > 0) return true;
		}

		return false;
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.save();

		const isColliding = this.aabb(this.a, this.b);

		ctx.drawSprite(this.imageA, this.a.x, this.a.y);
		ctx.drawSprite(this.imageB, this.b.x, this.b.y);

		ctx.strokeStyle = isColliding ? "red" : "yellow";
		ctx.beginPath();
		ctx.rect(this.a.x, this.a.y, this.a.width, this.a.height);
		ctx.stroke();

		ctx.strokeStyle = isColliding ? "red" : "purple";
		ctx.beginPath();
		ctx.rect(this.b.x, this.b.y, this.b.width, this.b.height);
		ctx.stroke();

		if (isColliding) {
			const intersection = this.getIntersection(this.a, this.b);
			ctx.strokeStyle = "green";
			ctx.beginPath();
			ctx.rect(intersection.x, intersection.y, intersection.width, intersection.height);
			ctx.stroke();

			const isPixelPerfect = this.pixelPerfectCollision(this.a, this.imageA, this.b, this.imageB, intersection);
			if (isPixelPerfect) {
				ctx.fillStyle = "green";
				ctx.font = "20px Arial";
				ctx.fillText("Pixel perfect collision", this.width / 2, this.height - 200);
			}
		}

		ctx.drawImage(this.cache, this.width / 2 - this.cache.width / 2, this.height - 200);
		ctx.strokeStyle = "white";
		ctx.strokeRect(this.width / 2 - this.cache.width / 2, this.height - 200, this.cache.width, this.cache.height);


		ctx.restore();
	}

}