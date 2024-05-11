export const Easings = {
	linear: (t: number) => t,
	easeInQuad: (t: number) => t * t,
	easeOutQuad: (t: number) => t * (2 - t),
	smoothstep: (t: number) => t * t * (3 - 2 * t),
};

export abstract class AnimatedValue {

	private timer = 0;
	private finished = false;

	constructor(
		private value: number,
		private target: number,
		private duration: number,
		private easing: keyof typeof Easings = "easeInQuad",
	) { }

	public update(deltaTime: number): boolean {
		if (this.isFinished) return false;

		this.timer += deltaTime;
		if (this.timer >= this.duration) {
			this.timer = this.duration;
			this.value = this.target;
			this.finished = true;
		} else {
			this.value += (this.target - this.value) * Easings[this.easing](this.timer / this.duration);
		}

		return true;
	}

	public get(): number {
		return this.value;
	}

	public set(value: number) {
		if (value === this.target) return;

		this.target = value;
		this.timer = 0;
		this.finished = false;
	}

	public getTime(): number {
		return this.timer / this.duration;
	}

	public get isFinished(): boolean {
		return this.finished;
	}

}