import { Rectangle } from "../models/rectangle";
import { Size } from "../types/size";

export class DensityCanvas {

	public element: HTMLCanvasElement = document.createElement("canvas");

	public context: CanvasRenderingContext2D;

	private virtualWidth = 0;

	private virtualHeight = 0;

	public drawRatio = 1;

	private overrideRatio: number | undefined = undefined;

	constructor(name: string | undefined = undefined) {
		if (name) this.element.id = name;

		const context = this.element.getContext("2d");
		if (!context) throw new Error("Could not get context of canvas");

		this.context = context;
		this.context.imageSmoothingEnabled = false;
		this.context["mozImageSmoothingEnabled"] = false;
		this.context["webkitImageSmoothingEnabled"] = false;
		this.context.filter = "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxmaWx0ZXIgaWQ9ImZpbHRlciIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj48ZmVDb21wb25lbnRUcmFuc2Zlcj48ZmVGdW5jUiB0eXBlPSJpZGVudGl0eSIvPjxmZUZ1bmNHIHR5cGU9ImlkZW50aXR5Ii8+PGZlRnVuY0IgdHlwZT0iaWRlbnRpdHkiLz48ZmVGdW5jQSB0eXBlPSJkaXNjcmV0ZSIgdGFibGVWYWx1ZXM9IjAgMSIvPjwvZmVDb21wb25lbnRUcmFuc2Zlcj48L2ZpbHRlcj48L3N2Zz4=#filter)";
		this.element.oncontextmenu = () => false;
	}

	private get backingStoreRatio(): number {
		return (
			this.overrideRatio ||
			(this.context["webkitBackingStorePixelRatio"]) ||
			(this.context["mozBackingStorePixelRatio"]) ||
			(this.context["msBackingStorePixelRatio"]) ||
			(this.context["oBackingStorePixelRatio"]) ||
			(this.context["backingStorePixelRatio"]) ||
			1
		);
	}

	private get devicePixelRation(): number {
		return this.overrideRatio || window.devicePixelRatio || 1;
	}

	private getDrawRatio(backingStoreRatio, devicePixelRatio): number {
		return devicePixelRatio / backingStoreRatio;
	}

	/**
	 * Sets the size of the canvas
	 *
	 * @param {number} width The width of the canvas, in pixels
	 * @param {number} height The width of the canvas, in pixels
	 */
	setSize(width: number, height: number) {
		// Calculate the display density pixel ratio
		this.drawRatio = this.getDrawRatio(this.backingStoreRatio, this.devicePixelRation);

		// Set the canvas size
		if (this.backingStoreRatio !== this.devicePixelRation) {
			// Set the virtual canvas size to the real resolution
			this.element.width = width * this.drawRatio;
			this.element.height = height * this.drawRatio;

			// Set the presented canvas size to the visible resolution
			this.element.style.width = `${width}px`;
			this.element.style.minWidth = `${width}px`;
			this.element.style.height = `${height}px`;
			this.element.style.minHeight = `${height}px`;
		} else {
			// 1:1 ratio, just scale it
			this.element.width = width;
			this.element.height = height;

			this.element.style.width = "";
			this.element.style.height = "";
		}

		// Scale the canvas according to the ratio
		this.context.scale(this.drawRatio, this.drawRatio);

		// Save the virtual size of the canvas
		this.virtualWidth = width;
		this.virtualHeight = height;
	}

	/** Clears the canvas */
	clear() {
		this.context.clearRect(0, 0, this.element.width, this.element.height);
	}

	/**
	 * Draws this canvas to another {@link foreignContext} canvas
	 *
	 * @param {number} x The x position to draw the canvas
	 * @param {number} y The y position to draw the canvas
	 * @param {CanvasRenderingContext2D} foreignContext The context to draw to
	 */
	drawTo(x: number, y: number, foreignContext: CanvasRenderingContext2D) {
		foreignContext.save();
		foreignContext.scale(1 / this.drawRatio, 1 / this.drawRatio);
		foreignContext.drawImage(this.element, x, y);
		foreignContext.restore();
	}

	/**
	 * Attaches the canvas element as child to given {@link element}
	 *
	 * @param {HTMLElement} element The element to attach the canvas to
	 */
	attachToElement(element: HTMLElement) {
		element.appendChild(this.element);
	}

	// #region Getters
	get width(): number {
		return this.virtualWidth || this.element.width;
	}

	get height(): number {
		return this.virtualHeight || this.element.height;
	}

	get bounds(): Rectangle {
		return new Rectangle(0, 0, this.width, this.height);
	}

	get size(): Size {
		return { width: this.width, height: this.height };
	}
	// #endregion

}