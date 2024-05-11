import "./extensions";
import { Log } from "./utils/log";
import { DensityCanvas } from "./components/density-canvas";
import { InputHandler } from "./components/input-handler";
import { IState } from "./states/state";
import { StatePlay } from "./states/state-play";
import { Gizmo } from "./utils/gizmo";
import { Cursor } from "./utils/cursor";
import { Theme } from "./utils/theme";
import { AudioSynth } from "./utils/audio";
import { PADDLE_MARGIN } from "./constants";
import { FontUtils } from "./utils/font";
import { StateMenu } from "./states/state-menu";

export class Main {

	// Graphics
	public canvas = new DensityCanvas("canvas");
	public ctx = this.canvas.context;
	private isDirty = true;

	// Frame
	private handleAnimationFrameRequest = -1;
	private lastFrameTime = performance.now();

	// Misc
	public state: IState = new StateMenu(this);
	public globalTimer = 0;

	constructor() {
		Log.info("Main", "Starting up...");
		this.attachHooks();
	}

	private attachHooks() {
		Log.info("Main", "Attaching hooks...");

		window.addLoadEventListener(this.onLoad.bind(this));
		window.addVisibilityChangeEventListener(this.onVisibilityChange.bind(this));
		window.addEventListener("resize", this.onResize.bind(this));

		InputHandler.setup(this);
	}

	// #region Event listeners
	private async onLoad() {
		Log.debug("Main", "Window loaded");

		// Attach the canvas element to DOM
		this.canvas.attachToElement(document.body);

		// Setup canvas
		this.onResize();

		await Theme.setup();
		await AudioSynth.setup();
		await FontUtils.setup();

		// Setup game state
		await this.state.setup();

		// Request the first frame
		this.requestNextFrame();
	}

	private onVisibilityChange(isVisible: boolean) {
		Log.info("Main", `Window visibility changed to ${isVisible ? "visible" : "hidden"}`);

		if (isVisible) {
			this.invalidate();

			// Request the next frame
			this.requestNextFrame();
		} else {
			// Cancel the next frame
			if (this.handleAnimationFrameRequest != -1) {
				cancelAnimationFrame(this.handleAnimationFrameRequest);
			}
		}
	}

	private onResize() {
		Log.debug("Main", "Window resized");

		const aspectRatio = 16 / 10;
		const maxWidth = 1200;
		const maxHeight = maxWidth / aspectRatio;
		let width = window.innerWidth - PADDLE_MARGIN * 4;
		let height = window.innerHeight - PADDLE_MARGIN * 4;

		if (height > maxHeight) {
			height = maxHeight;
		}

		if (width > maxWidth) {
			width = maxWidth;
		}

		// Enforce aspect ratio
		if (width / height > aspectRatio) {
			width = height * aspectRatio;
		} else {
			height = width / aspectRatio;
		}

		// Resize canvas
		this.canvas.setSize(width, height);

		// Setup game state
		this.state.resize();
	}
	// #endregion

	// #region State management
	public setState(state: IState) {
		this.state = state;
		this.state.setup();
		this.state.resize();
		this.invalidate();
	}
	// #endregion

	// #region Frame
	public invalidate() {
		this.isDirty = true;
	}

	private requestNextFrame() {
		this.handleAnimationFrameRequest = requestAnimationFrame(this.loop.bind(this));
	}

	private async loop(time: DOMHighResTimeStamp) {
		const deltaTime = (time - this.lastFrameTime) / 1000.0;
		this.lastFrameTime = time;

		Cursor.reset();
		await this.state.update(deltaTime);
		InputHandler.update();
		Cursor.apply();

		if (this.isDirty) {
			this.state.render(this.ctx);
			this.isDirty = false;
		}

		Gizmo.render(this.ctx);
		Gizmo.clear();

		this.requestNextFrame();
	}
	// #endregion

}

// Start the game
window._instance = new Main();
