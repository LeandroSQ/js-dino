/* eslint-disable max-statements */
import "./extensions";
import { Analytics } from "./models/analytics";
import { Log } from "./utils/log";
import { DensityCanvas } from "./components/density-canvas";
import { InputHandler } from "./components/input-handler";
import { AState } from "./types/state";
import { Gizmo } from "./utils/gizmo";
import { Cursor } from "./utils/cursor";
import { Theme } from "./utils/theme";
import { MARGIN, SIMULATION_FREQUENCY, SIMULATION_SUBSTEPS, USE_ANIMATION_FRAME } from "./constants";
import { FontUtils } from "./utils/font";
import { StateMenu } from "./states/state-menu";
import { StatePlay } from "./states/state-play";
import { SpriteSheet } from "./utils/spritesheet";
import { Cloud } from "./models/cloud";
import { Size } from "./types/size";
import { CloudSpawner } from "./models/cloud-spawner";
import { AudioUtils } from "./utils/audio";
import { ImageUtils } from "./utils/image";

export class Main {

	// Graphics
	public canvas = new DensityCanvas("canvas");
	public screen: Size = { width: 0, height: 0 };
	private isDirty = true;

	// Frame
	private handleAnimationFrameRequest = -1;
	private lastFrameTime = performance.now();

	// Misc
	public globalTimer = 0;
	private analytics: Analytics;

	// Entities
	private cloudSpawner = new CloudSpawner(this);
	public clouds: Cloud[] = [];

	// Game logic
	public state: AState;

	constructor() {
		Log.info("Main", "Starting up...");

		if (DEBUG) this.state = new StatePlay(this);
		else this.state = new StateMenu(this);

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
		try {
			Log.debug("Main", "Window loaded");

			// Attach the canvas element to DOM
			this.canvas.attachToElement(document.body);

			// Setup canvas
			this.onResize();

			// Load modules in parallel
			const modules = [
				Theme.setup(),
				FontUtils.setup(),
				AudioUtils.setup(),
				ImageUtils.setup(),
				SpriteSheet.setup(),
			];

			// Analytics profiler, only on DEBUG
			if (DEBUG) {
				this.analytics = new Analytics(this);
				modules.push(this.analytics.setup());
			}

			await Promise.all(modules);

			// Setup game state
			await this.state.setup();

			// Spawn initial clouds
			this.cloudSpawner.setup();

			// Request the first frame
			this.requestNextFrame();
		} catch (e) {
			Log.error("Main", "Failed to load modules", e);
			alert(`Failed to load modules. Please refresh the page.${DEBUG ? `Error: ${e}` : ""}`);
		}
	}

	private onVisibilityChange(isVisible: boolean) {
		Log.info("Main", `Window visibility changed to ${isVisible ? "visible" : "hidden"}`);

		if (isVisible) {
			if (this.handleAnimationFrameRequest >= 0) {
				if (USE_ANIMATION_FRAME) {
					cancelAnimationFrame(this.handleAnimationFrameRequest as number);
				} else {
					clearInterval(this.handleAnimationFrameRequest as number);
				}
			}

			this.invalidate();
			this.lastFrameTime = performance.now();

			// Request the next frame
			setTimeout(this.requestNextFrame.bind(this), 0);
		} else {
			// Cancel the next frame
			if (this.handleAnimationFrameRequest) {
				if (USE_ANIMATION_FRAME) {
					cancelAnimationFrame(this.handleAnimationFrameRequest as number);
				} else {
					clearInterval(this.handleAnimationFrameRequest as number);
				}

				this.handleAnimationFrameRequest = -1;
			}
		}
	}

	private onResize() {
		Log.debug("Main", "Window resized");

		let width = window.innerWidth - MARGIN * 4;
		let height = window.innerHeight - MARGIN * 4;

		if (window.isMobile() || window.innerWidth < 800) {
			document.body.classList.add("mobile");
			width = window.innerWidth;
			height = window.innerHeight;
			this.screen = { width, height: height * 0.75 };
		} else {
			document.body.classList.remove("mobile");
			const aspectRatio = 16 / 10;
			const maxWidth = 1200;
			const maxHeight = maxWidth / aspectRatio;
			if (width > maxWidth) width = maxWidth;
			if (height > maxHeight) height = maxHeight;

			// Enforce aspect ratio
			if (width / height > aspectRatio) {
				width = height * aspectRatio;
			} else {
				height = width / aspectRatio;
			}

			this.screen	= { width, height };
		}

		// Resize canvas
		this.canvas.setSize(width, height);
		this.invalidate();
	}
	// #endregion

	// #region State management
	public setState(state: AState) {
		this.state = state;
		this.state.setup();
		Cursor.apply(this.canvas.element);
		this.invalidate();
	}
	// #endregion

	// #region Frame
	public invalidate() {
		this.isDirty = true;
	}

	private requestNextFrame() {
		if (USE_ANIMATION_FRAME) {
			this.handleAnimationFrameRequest = requestAnimationFrame(this.loop.bind(this));
		} else {
			if (this.handleAnimationFrameRequest === -1) {
				this.handleAnimationFrameRequest = setInterval(() => this.loop(performance.now()), 1000 / SIMULATION_FREQUENCY) as unknown as number;
			}
		}
	}

	private updateClouds(deltaTime: number) {
		this.cloudSpawner.update(deltaTime);
		this.clouds.forEach(x => x.update(deltaTime));
	}

	private update(newTime: DOMHighResTimeStamp) {
		const deltaTime = (newTime - this.lastFrameTime) / 1000.0;
		this.lastFrameTime = newTime;

		const dt = deltaTime / SIMULATION_SUBSTEPS;
		for (let i = 0; i < SIMULATION_SUBSTEPS; i++) {
			this.state.update(dt);
			InputHandler.update();
			if (DEBUG) this.analytics.endUpdate();
		}

		this.updateClouds(deltaTime);
		if (DEBUG) this.analytics.update(deltaTime);
		this.globalTimer += deltaTime;
	}

	private loop(time: DOMHighResTimeStamp) {
		this.update(time);
		Cursor.apply(this.canvas.element);

		// Redraw canvas, if needed
		if (this.isDirty) {
			if (DEBUG) this.analytics.startFrame(time);
			this.canvas.clear();

			// State overlay
			for (const cloud of this.clouds) cloud.render(this.canvas.context);
			this.state.render(this.canvas.context);
			this.isDirty = false;

			// Render analytics
			if (DEBUG) this.analytics.render(this.canvas.context);

			Gizmo.render(this.canvas.context);
			Gizmo.clear();
			if (DEBUG) this.analytics.endFrame();
		}

		this.requestNextFrame();
	}
	// #endregion

}

// Start the game
window._instance = new Main();
