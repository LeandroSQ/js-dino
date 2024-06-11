import { Vector } from "./../models/vector";
import { Rectangle } from "../models/rectangle";
import { Vector } from "../models/vector";
import { Color } from "./color";

interface IGizmo {

	render(ctx: CanvasRenderingContext2D);

}

class StrokeRectangleGizmo implements IGizmo {

	constructor(private rect: Rectangle, private color: string) { }

	public render(ctx: CanvasRenderingContext2D) {
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 1;
		ctx.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
	}

}

class RectangleGizmo implements IGizmo {

	constructor(private rect: Rectangle, private color: string) { }

	public render(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
	}

}

class LineGizmo implements IGizmo {

	constructor(private start: Vector, private end: Vector, private color: string, private thickness: number) { }

	public render(ctx: CanvasRenderingContext2D) {
		ctx.strokeStyle = this.color;
		ctx.lineWidth = this.thickness;

		ctx.beginPath();
		ctx.moveTo(this.start.x, this.start.y);
		ctx.lineTo(this.end.x, this.end.y);
		ctx.stroke();
	}

}

class CircleGizmo implements IGizmo {

	constructor(private center: Vector, private radius: number, private color: string, private fill: boolean) { }

	public render(ctx: CanvasRenderingContext2D) {
		if (this.fill) ctx.fillStyle = this.color;
		else ctx.strokeStyle = this.color;
		ctx.lineWidth = 1;

		ctx.beginPath();
		ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
		if (this.fill) ctx.fill();
		else ctx.stroke();
	}

}

class TextGizmo implements IGizmo {

	constructor(private text: string, private position: Vector, private color: string, private alignment: CanvasTextAlign) { }

	public render(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.font = "12px Arial";
		ctx.textAlign = this.alignment;
		ctx.fillText(this.text, this.position.x, this.position.y);
		ctx.restore();
	}

}

class VectorGizmo implements IGizmo {

	private readonly ARROWHEAD_LENGTH = 10;
	private readonly ARROWHEAD_ANGLE = Math.PI / 6;
	private readonly MIN_LENGTH = 1;
	private readonly MAX_LENGTH = 100;

	constructor(private origin: Vector, private vector: Vector, private color: string) { }

	// eslint-disable-next-line max-statements
	public render(ctx: CanvasRenderingContext2D) {
		let length = this.vector.length;

		// If vector is zero, don't draw anything
		if (length < this.MIN_LENGTH) return;

		// Clamp vector length to 100
		if (length > this.MAX_LENGTH) {
			this.vector = this.vector.normalize().multiply(this.MAX_LENGTH);
			length = this.MAX_LENGTH;
		}

		// Calculate opacity 0-1 based on vector length
		const opacity = (length - this.MIN_LENGTH) / (this.MAX_LENGTH - this.MIN_LENGTH);
		const color = Color.alpha(this.color, opacity);

		// Draw line
		ctx.fillStyle = color;
		ctx.strokeStyle = color;
		ctx.lineWidth = 1.5;
		ctx.lineCap = "round";

		ctx.beginPath();
		ctx.moveTo(this.origin.x, this.origin.y);
		ctx.lineTo(this.origin.x + this.vector.x, this.origin.y + this.vector.y);
		ctx.stroke();

		// Draw arrowhead
		const arrowheadLength = 10;
		const arrowheadAngle = Math.PI / 6;

		const angle = Math.atan2(this.vector.y, this.vector.x);

		ctx.beginPath();
		ctx.moveTo(this.origin.x + this.vector.x, this.origin.y + this.vector.y);
		ctx.lineTo(this.origin.x + this.vector.x - arrowheadLength * Math.cos(angle - arrowheadAngle), this.origin.y + this.vector.y - arrowheadLength * Math.sin(angle - arrowheadAngle));
		ctx.lineTo(this.origin.x + this.vector.x - arrowheadLength * Math.cos(angle + arrowheadAngle), this.origin.y + this.vector.y - arrowheadLength * Math.sin(angle + arrowheadAngle));
		ctx.lineTo(this.origin.x + this.vector.x, this.origin.y + this.vector.y);
		ctx.fill();
	}

}

export class Gizmo {

	static list: IGizmo[] = [];

	static render(ctx: CanvasRenderingContext2D) {
		if (!DEBUG) return;

		ctx.save();
		for (const gizmo of Gizmo.list) gizmo.render(ctx);
		ctx.restore();
	}

	static clear() {
		if (!DEBUG) return;

		Gizmo.list = [];
	}

	static rect(rect: Rectangle, color = "#fff") {
		if (!DEBUG) return;

		Gizmo.list.push(new RectangleGizmo(rect, color));
	}

	static outline(rect: Rectangle, color = "#fff") {
		if (!DEBUG) return;

		Gizmo.list.push(new StrokeRectangleGizmo(rect, color));
	}

	static line(start: Vector, end: Vector, color = "#fff", thickness = 1) {
		if (!DEBUG) return;

		Gizmo.list.push(new LineGizmo(start, end, color, thickness));
	}

	static circle(center: Vector, radius: number, color = "#fff", fill = true) {
		if (!DEBUG) return;

		Gizmo.list.push(new CircleGizmo(center, radius, color, fill));
	}

	static text(text: string, position: Vector, color = "#fff", alignment: CanvasTextAlign = "left") {
		if (!DEBUG) return;

		Gizmo.list.push(new TextGizmo(text, position, color, alignment));
	}

	static arrow(origin: Vector, vector: Vector, color = "#fff") {
		if (!DEBUG) return;

		Gizmo.list.push(new VectorGizmo(origin, vector, color));
	}

}