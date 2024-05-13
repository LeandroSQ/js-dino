export abstract class AState {

	setup(): Promise<void> {
		return Promise.resolve();
	}

	abstract update(deltaTime: number);

	preRender(ctx: CanvasRenderingContext2D) {
		/* Ignore */
	}

	render(ctx: CanvasRenderingContext2D) {
		/* Ignore */
	}

}