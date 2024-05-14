export class Vector {

	public x: number;
	public y: number;

	constructor(x: number, y: number | undefined = undefined) {
		this.x = x;

		if (y === undefined) this.y = x;
		else this.y = y;
	}

	public dot(vector: Vector): number {
		return this.x * vector.x + this.y * vector.y;
	}

	public add(vector: Vector): Vector {
		return new Vector(this.x + vector.x, this.y + vector.y);
	}

	public subtract(vector: Vector): Vector {
		return new Vector(this.x - vector.x, this.y - vector.y);
	}

	public multiply(scalar: number): Vector {
		return new Vector(this.x * scalar, this.y * scalar);
	}

	public divide(divisor: number): Vector {
		return new Vector(this.x / divisor, this.y / divisor);
	}

	public normalize(): Vector {
		const length = this.length;

		return new Vector(this.x / length, this.y / length);
	}

	public clone(): Vector {
		return new Vector(this.x, this.y);
	}

	public static distance(a: Vector, b: Vector): number {
		return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
	}

	public static random(scalar: number): Vector {
		return new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().multiply(scalar);
	}

	public get length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	public static get zero() {
		return new Vector(0, 0);
	}

	public toString(): string {
		return `{ ${this.x}, ${this.y} }`;
	}

}
