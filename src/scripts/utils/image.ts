import { Size } from "./../types/size";
import { Optional } from "../types/optional";
import { Log } from "./log";
import { Vector } from "../models/vector";
import { Sprite, SpriteSheet } from "./spritesheet";
import { Rectangle } from "../models/rectangle";

export abstract class ImageUtils {

	private static readonly cache: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();
	private static tempCanvas: HTMLCanvasElement;
	private static tempContext: CanvasRenderingContext2D;

	public static async setup() {
		this.tempCanvas = document.createElement("canvas");
		this.tempCanvas.style.display = "none";

		const ctx = this.tempCanvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) throw new Error("Failed to get 2D context from canvas");
		this.tempContext = ctx;
	}

	public static load(id: string, size: Optional<Size> = null): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			if (this.cache.has(id)) {
				const value = this.cache.get(id);
				if (value === undefined) throw new Error("Unexpected undefined value in cache");

				return resolve(value);
			}

			const image = new Image();
			image.src = `${window.location.href}/assets/images/${id}.png`;
			image.crossOrigin = "anonymous";
			image.style.display = "none";
			image.id = `image-${id}`;

			if (size) {
				image.width = size.width;
				image.height = size.height;
			}

			image.onerror = (e) => {
				Log.error("ImageUtils", `Failed to load image: ${id}`, e.toString());
				reject(e);
			};
			image.onload = () => {
				this.cache.set(id, image);
				resolve(image);
			};
		});
	}

	public static get(id: string): Optional<HTMLImageElement> {
		if (!this.cache.has(id)) return null;

		const value = this.cache.get(id);
		if (value === undefined) throw new Error("Unexpected undefined value in cache");

		return value;
	}

	public static pixelPerfectCollision(aPosition: Vector, aSprite: Sprite, bPosition: Vector, bSprite: Sprite): boolean {
		// First pass - AABB collision
		const rectA = new Rectangle(aPosition.x, aPosition.y, aSprite.width, aSprite.height);
		const rectB = new Rectangle(bPosition.x, bPosition.y, bSprite.width, bSprite.height);
		if (!rectA.intersects(rectB)) return false;

		const intersection = rectA.intersection(rectB);
		if (intersection.width <= 1 || intersection.height <= 1) return false;

		// Second pass - pixel perfect collision
		this.tempCanvas.width = intersection.width;
		this.tempCanvas.height = intersection.height;
		this.tempContext.clearRect(0, 0, intersection.width, intersection.height);

		// Draw sprite over the other, composite operation will act as mask
		this.tempContext.drawImage(
			SpriteSheet.source,
			aSprite.x + (intersection.x - aPosition.x),
			aSprite.y + (intersection.y - aPosition.y),
			intersection.width,
			intersection.height,
			0, 0,
			intersection.width,
			intersection.height
		);
		this.tempContext.globalCompositeOperation = "source-in";
		this.tempContext.drawImage(
			SpriteSheet.source,
			bSprite.x + (intersection.x - bPosition.x),
			bSprite.y + (intersection.y - bPosition.y),
			intersection.width,
			intersection.height,
			0, 0,
			intersection.width,
			intersection.height
		);

		// Check if any pixel is not transparent
		const data = this.tempContext.getImageData(0, 0, intersection.width, intersection.height).data;
		for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;

		return false;
	}

}