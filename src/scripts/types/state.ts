/* eslint-disable @typescript-eslint/no-unused-vars */
export abstract class AState {

	setup(): Promise<void> {
		return Promise.resolve();
	}

	update(deltaTime: number) {
		// Ignore
	}

	render(ctx: CanvasRenderingContext2D) {
		// Ignore
	}

}