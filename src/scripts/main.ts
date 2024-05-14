/* eslint-disable max-statements */
import "./extensions";
import { Analytics } from "./models/analytics";
import { Log } from "./utils/log";
import { DensityCanvas } from "./components/density-canvas";
import { InputHandler } from "./components/input-handler";
import { AState } from "./states/state";
import { Gizmo } from "./utils/gizmo";
import { Cursor } from "./utils/cursor";
import { Theme } from "./utils/theme";
import { AudioSynth } from "./utils/audio";
import { AUDIO_SCORE_HZ, BALL_BOUNCE_SCALING, PREPARATION_TIME, BLOCK_GAP, BLOCK_HEIGHT, BLOCK_WIDTH, PADDLE_MARGIN, AUDIO_RESET_TIME, AUDIO_TIMER_HZ, AUDIO_BOUNCE_HZ, BALL_RADIUS, PARTICLE_COUNT, PARTICLE_SPREAD, PARTICLE_SPEED } from "./constants";
import { FontUtils } from "./utils/font";
import { StateMenu } from "./states/state-menu";
import { APaddle } from "./models/paddle";
import { Block } from "./models/block";
import { Ball } from "./models/ball";
import SETTINGS from "./settings";
import { Vector } from "./models/vector";
import { Particle } from "./models/particle";

export class Main {

	// Graphics
	public canvas = new DensityCanvas("canvas");
	private isDirty = true;
	private blocksBuffer = new DensityCanvas("block-buffer");
	private isBlocksBufferDirty = true;

	// Frame
	private handleAnimationFrameRequest = -1;
	private lastFrameTime = performance.now();

	// Misc
	public globalTimer = 0;
	private analytics: Analytics;

	// Entities
	public paddle: APaddle;
	public blocks: Array<Block> = [];
	public ball: Ball;
	public particles: Array<Particle> = [];

	// Game logic
	public state: AState = new StateMenu(this);
	public preparationTimer = PREPARATION_TIME;
	public lives = 3;
	private lastTimer = 0;
	private audioPitch = 0;
	private timeSinceLastHit = 0;

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

	// #region Utility
	get isInPreparationTime() {
		return this.preparationTimer > 0;
	}

	public generateBlocks() {
		this.blocks = [];

		// Calculate maximum number of blocks that can fit on the screen
		const columns = Math.floor((this.canvas.width - BLOCK_GAP * 2 - BLOCK_WIDTH * 2) / (BLOCK_WIDTH + BLOCK_GAP));
		const rows = Math.floor((this.canvas.height / 2 - BLOCK_GAP * 2 - BLOCK_HEIGHT) / (BLOCK_HEIGHT + BLOCK_GAP));

		// Calculate the offset to center the blocks
		const offsetX = this.canvas.width / 2 - (columns * (BLOCK_WIDTH + BLOCK_GAP)) / 2 + BLOCK_GAP / 2;
		const offsetY = this.canvas.height / 2 - (rows * (BLOCK_HEIGHT + BLOCK_GAP));

		// Generate blocks
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < columns; col++) {
				const x = col * (BLOCK_WIDTH + BLOCK_GAP) + offsetX;
				const y = row * (BLOCK_HEIGHT + BLOCK_GAP) + offsetY;
				const color = `oklch(from hsl(${row / rows * 100} 50% 50%) l c h)`;

				this.blocks.push(new Block(x, y, color));
			}
		}

		this.invalidateBlocksBuffer();
	}

	public reset(resetLives = false) {
		// Reset variables
		this.preparationTimer = PREPARATION_TIME;
		if (resetLives) this.lives = 3;
		SETTINGS.DIFFICULTY = 1.0;

		// Re-position ball
		this.ball.reset();
	}
	// #endregion

	// #region Event listeners
	private async onLoad() {
		Log.debug("Main", "Window loaded");

		// Attach the canvas element to DOM
		this.canvas.attachToElement(document.body);

		// Setup canvas
		this.onResize();

		// Load modules in parallel
		const modules = [
			Theme.setup(),
			AudioSynth.setup(),
			FontUtils.setup()
		];

		// Analytics profiler, only on DEBUG
		if (DEBUG) {
			this.analytics = new Analytics(this);
			modules.push(this.analytics.setup());
		}

		await Promise.all(modules);

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
		const previousSize = this.canvas.size;
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
		this.blocksBuffer.setSize(width, height);
		this.invalidate();
		this.invalidateBlocksBuffer();

		// TODO: Re-position paddle
		// TODO: Re-position ball
		// TODO: Re-position blocks
	}

	public onBallBounceOffPaddle() {
		this.addParticleExplosion();

		AudioSynth.playWithDurationVariance(AUDIO_BOUNCE_HZ);
		SETTINGS.DIFFICULTY *= BALL_BOUNCE_SCALING;
	}

	public onBallBounceOffBlock() {
		this.addParticleExplosion();

		this.timeSinceLastHit = performance.now();
		this.audioPitch += 0.25;
		const pan = Math.min(1, Math.max(-1, (this.ball.bounds.center.x - screen.width / 2) / (screen.width / 2)));
		const frequency = AUDIO_SCORE_HZ * (1.0 + this.audioPitch);
		AudioSynth.playWithDurationVariance(frequency, pan);
		SETTINGS.DIFFICULTY *= BALL_BOUNCE_SCALING;
		this.invalidateBlocksBuffer();
	}

	public onBallBounceOffBottom() {
		this.lives--;
		this.reset();
		AudioSynth.playWithDurationVariance(AUDIO_BOUNCE_HZ);
	}
	// #endregion

	// #region State management
	public setState(state: AState) {
		this.state = state;
		this.state.setup();
		Cursor.apply();
		this.invalidate();
	}
	// #endregion

	// #region Frame
	public invalidate() {
		this.isDirty = true;
	}

	public invalidateBlocksBuffer() {
		this.isBlocksBufferDirty = true;
		this.isDirty = true;
	}

	private requestNextFrame() {
		this.handleAnimationFrameRequest = requestAnimationFrame(this.loop.bind(this));
	}

	public addParticleExplosion() {
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const position = Vector.random(PARTICLE_SPREAD).add(this.ball.bounds.center);
			const velocity = Vector.random(PARTICLE_SPEED).add(this.ball.velocity.multiply(0.25));
			this.particles.push(new Particle(position, velocity));
		}
	}

	private updateTimers(time: DOMHighResTimeStamp, deltaTime: number) {
		// Update bounce audio pitch
		if (time - this.timeSinceLastHit > AUDIO_RESET_TIME) this.audioPitch = 0;

		// Update preparation timer, and accelerate ball to random direction when timer reaches zero
		if (this.ball.velocity.length === 0) {
			if (this.preparationTimer <= 0) this.ball.accelerateToRandomDirection();
			else this.preparationTimer -= deltaTime;

			// Play sound countdown when in preparation, every second
			if (Math.floor(this.preparationTimer) !== this.lastTimer) {
				this.lastTimer = Math.floor(this.preparationTimer);
				const frequency = AUDIO_TIMER_HZ * (PREPARATION_TIME - this.preparationTimer + 1);
				AudioSynth.playWithDurationVariance(frequency);
			}

			Gizmo.text(this.preparationTimer.toFixed(2), this.ball.bounds.center.add(new Vector(0, BALL_RADIUS * 4)), "red", "center");
		}

		if (DEBUG) this.analytics.update(deltaTime);
	}

	public updateEntities(deltaTime: number) {
		this.updateTimers(performance.now(), deltaTime);
		const substeps = 4;
		const subDeltaTime = deltaTime / substeps;
		for (let i = 0; i < substeps; i++) {
			this.ball.update(subDeltaTime);
			this.paddle.update(subDeltaTime);
			if (DEBUG) this.analytics.commitUpdate();
		}

		// Update particles
		for (let i = this.particles.length - 1; i >= 0; i--) {
			this.invalidate();
			this.particles[i].update(deltaTime);
			if (this.particles[i].duration <= 0) {
				this.particles.splice(i, 1);
			}
		}
	}

	private renderEntities() {
		this.canvas.clear();

		// Render
		this.canvas.context.save();
		this.state.preRender(this.canvas.context);
		this.blocksBuffer.drawTo(0, 0, this.canvas.context);
		this.ball.render(this.canvas.context);
		this.paddle.render(this.canvas.context);
		this.canvas.context.restore();

		// Render particles
		for (const particle of this.particles) particle.render(this.canvas.context);

		// State overlay
		this.state.render(this.canvas.context);
		this.isDirty = false;

		// Render analytics
		if (DEBUG) this.analytics.render(this.canvas.context);
	}

	private loop(time: DOMHighResTimeStamp) {
		const deltaTime = (time - this.lastFrameTime) / 1000.0;
		this.lastFrameTime = time;

		if (DEBUG) this.analytics.startFrame(time);

		this.state.update(deltaTime);
		InputHandler.update();

		// Redraw blocks buffer, if needed
		if (this.isBlocksBufferDirty) {
			this.isBlocksBufferDirty = false;
			this.blocksBuffer.clear();
			for (const block of this.blocks) {
				block.render(this.blocksBuffer.context);
			}
		}

		// Redraw canvas, if needed
		if (this.isDirty) {
			this.renderEntities();
		}

		Gizmo.render(this.canvas.context);
		Gizmo.clear();

		if (DEBUG) this.analytics.endFrame();

		this.requestNextFrame();
	}
	// #endregion

}

// Start the game
window._instance = new Main();
