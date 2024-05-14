import { PARTICLE_END_SIZE } from "./../constants";
import { PARTICLE_START_SIZE, PARTICLE_TIME_TO_LIVE } from "../constants";
import { Color } from "../utils/color";
import { Theme } from "../utils/theme";
import { Vector } from "./vector";

export class Particle {

	constructor(
		public position: Vector,
		public velocity: Vector,
		public duration = PARTICLE_TIME_TO_LIVE
	) { }

	private get opacity(): number {
		return (this.duration / PARTICLE_TIME_TO_LIVE) * (Theme.isDark ? 0.10 : 0.4);
	}

	private get size(): number {
		return (1.0 - this.duration / PARTICLE_TIME_TO_LIVE) * (PARTICLE_END_SIZE - PARTICLE_START_SIZE) + PARTICLE_START_SIZE;
	}

	public update(deltaTime: number) {
		this.position = this.position.add(this.velocity.multiply(deltaTime));
		this.velocity = this.velocity.multiply(0.95).add(Vector.random(500 * deltaTime));
		this.duration -= deltaTime;
		if (this.duration <= 0) this.duration = 0;
	}

	public render(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = Color.alpha(Theme.foreground, this.opacity);
		ctx.beginPath();
		ctx.fillRect(this.position.x, this.position.y, this.size, this.size);
	}

}