import { Optional } from "../types/optional";
import { Rectangle } from "./rectangle";
import { Vector } from "./vector";

export class Ray {

	constructor(public start: Vector, public end: Vector) {}

	public intersects(rectangle: Rectangle): boolean {
		const x1 = this.start.x;
		const y1 = this.start.y;
		const x2 = this.end.x;
		const y2 = this.end.y;

		const x3 = rectangle.x;
		const y3 = rectangle.y;
		const x4 = rectangle.x + rectangle.width;
		const y4 = rectangle.y + rectangle.height;

		const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (denominator === 0) return false;

		const numerator1 = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4);
		const numerator2 = (x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3);
		const t = numerator1 / denominator;
		const u = -numerator2 / denominator;

		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return true;
		}

		return false;
	}

	public intersection(rectangle: Rectangle): Optional<Vector> {
		const x1 = this.start.x;
		const y1 = this.start.y;
		const x2 = this.end.x;
		const y2 = this.end.y;

		const x3 = rectangle.x;
		const y3 = rectangle.y;
		const x4 = rectangle.x + rectangle.width;
		const y4 = rectangle.y + rectangle.height;

		const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (denominator === 0) return null;

		const numerator1 = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4);
		const numerator2 = (x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3);
		const t = numerator1 / denominator;
		const u = -numerator2 / denominator;

		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return new Vector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
		}

		return null;
	}

}