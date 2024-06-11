/* eslint-disable max-statements */
import { InputHandler } from "../components/input-handler";
import { MouseButton } from "../types/mouse-button";
import { FONT_FAMILY, FONT_SIZE, MARGIN } from "../constants";
import { Main } from "../main";
import { Color } from "../utils/color";
import { Cursor } from "../utils/cursor";
import { CursorType } from "../types/cursor-type";
import { Theme } from "../utils/theme";
import { AState } from "../types/state";
import { StatePlay } from "./state-play";
import { Log } from "../utils/log";
import { Sprite, SpriteSheet } from "../utils/spritesheet";
import { Rectangle } from "../models/rectangle";
import { AudioUtils } from "../utils/audio";
import { SoundFX } from "../types/soundfx";
import { TextAlign } from "../types/text-align";

export class StateMenu extends AState {

	private dimTimer = 0;

	private blinkTimer = 0;
	private lastBlinkTime = 0;
	private isBlinking = false;
	private blinkCount = 0;

	// Transition to play state
	private isTransitioningToPlay = false;
	private startGameTimer = 0;

	// Jumping
	private isJumping = false;
	private jumpTimer = 0;
	private jumpOffset = 0;

	constructor(private main: Main) {
		super();
	}

	// #region Utility
	public get width() {
		return this.main.screen.width;
	}

	public get height() {
		return this.main.screen.height;
	}

	public invalidate() {
		this.main.invalidate();
	}
	// #endregion

	async setup() {
		Log.debug("StateMenu", "Setting up...");

		Cursor.set(CursorType.Pointer);
	}

	private updateBlinking(deltaTime: number) {
		// Some ridiculous over-engineering to make the dino blink
		// Extremely important, since a double-blinking dino is cute
		const minimumBlinkInterval = 3.5 + Math.random() * 2 - 1.0;
		const blinkDuration = 0.075;
		if (this.isBlinking) {
			this.blinkTimer += deltaTime;
			if (this.blinkTimer >= blinkDuration) {
				this.isBlinking = false;
				this.blinkCount++;

				if (this.blinkCount < 2 && Math.random() <= 0.65) {
					this.lastBlinkTime = this.main.globalTimer - (minimumBlinkInterval - blinkDuration);
				} else {
					this.blinkCount = 0;
				}
			}
		} else if (this.main.globalTimer - this.lastBlinkTime >= minimumBlinkInterval && Math.random() <= 0.075) {
			this.lastBlinkTime = this.main.globalTimer;
			this.isBlinking = true;
			this.blinkTimer = 0;
		}
	}

	private updateJumping(deltaTime: number) {
		const jumpTime = 0.6;

		if (this.isJumping) {
			this.jumpTimer += deltaTime;
			this.jumpOffset = Math.pow(Math.sin(this.jumpTimer / jumpTime * Math.PI), 2.0) * SpriteSheet.dino0.height * 0.75;

			if (this.jumpTimer >= jumpTime) {
				this.jumpOffset = 0;
				this.jumpTimer = 0;
				this.isJumping = false;
				this.isTransitioningToPlay = true;
			}
		} else {
			this.jumpTimer = 0;
		}
	}

	private updateStartGameTransition(deltaTime: number) {
		if (this.isTransitioningToPlay) {
			this.startGameTimer += deltaTime;

			if (this.startGameTimer >= 3.0) {
				this.main.setState(new StatePlay(this.main));
			}
		}
	}

	update(deltaTime: number) {
		this.dimTimer += deltaTime;
		if (this.dimTimer >= 1) this.dimTimer = 1;

		this.updateJumping(deltaTime);
		this.updateBlinking(deltaTime);
		this.updateStartGameTransition(deltaTime);

		// Start game on click
		if (InputHandler.isDirty && !this.isJumping && !this.isTransitioningToPlay) {
			AudioUtils.play(SoundFX.Jump);
			this.isJumping = true;
			Cursor.set(CursorType.Default);
		}

		this.invalidate();
	}

	private getDinoSprite() {
		// Smoooooth it out
		const transitionProgress = Math.smoothstep(Math.min(this.startGameTimer / 2.0, 1.0));

		// Calculate dino bounds
		const bounds = new Rectangle(
			(this.width / 2 - SpriteSheet.dino0.width / 2) * (1.0 - transitionProgress) + (MARGIN * transitionProgress),
			this.height - SpriteSheet.ground.height - SpriteSheet.dino0.height + SpriteSheet.groundOffset - this.jumpOffset,
			SpriteSheet.dino0.width,
			SpriteSheet.dino0.height,
		);

		let sprite: Sprite;
		if (this.isJumping) {// Jumping
			sprite = SpriteSheet.dino0;
		} else if (transitionProgress > 0 && transitionProgress < 1.0) {// Moonwalk
			sprite = Math.floor(transitionProgress * 10) % 3 <= 1 ? SpriteSheet.dino3 : SpriteSheet.dino2;
		} else {
			if (transitionProgress < 1.0 && bounds.contains(InputHandler.mouse)) {// Crouch when move hover
				if (InputHandler.mouse.y < bounds.y + bounds.height / 2) {
					sprite = SpriteSheet.dinoCrouch1;
					bounds.y = this.height - SpriteSheet.ground.height - SpriteSheet.dinoCrouch1.height + SpriteSheet.groundOffset;
				} else {
					sprite = SpriteSheet.dinoCrouch2;
				}
			} else {// Blinking
				sprite = this.isBlinking ? SpriteSheet.dino1 : SpriteSheet.dino0;
			}
		}

		return { sprite, bounds };
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.globalAlpha = Math.pow(this.dimTimer, 2.0);
		ctx.shadowColor = Theme.containerShadow;
		ctx.shadowBlur = 10 * Math.pow(this.dimTimer, 4.0);
		ctx.shadowOffsetY = 2.5;

		// Title
		ctx.textBaseline = "top";
		ctx.font = `${FONT_SIZE}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Theme.foreground;
		ctx.fillTextAligned("Dino", this.width / 2, this.height / 2 - FONT_SIZE * 2.5, TextAlign.Center);

		// Subtitle
		ctx.font = `${FONT_SIZE / 2}pt ${FONT_FAMILY}`;
		ctx.fillStyle = Color.alpha(Theme.foreground, Math.pow(Math.oscilate(this.main.globalTimer, 0.5, 0.25, 0.75), 2.0));
		ctx.fillTextAligned("Press to start", this.width / 2, this.height / 2 - FONT_SIZE, TextAlign.Center);

		// Draw the ground
		ctx.shadowBlur = 0;
		ctx.shadowColor = "transparent";
		ctx.drawImage(
			SpriteSheet.source,
			SpriteSheet.ground.x,
			SpriteSheet.ground.y,
			this.width,
			SpriteSheet.ground.height,
			0, this.height - SpriteSheet.ground.height, this.width, SpriteSheet.ground.height
		);

		// Draw the dino
		const { sprite, bounds } = this.getDinoSprite();
		ctx.drawSprite(sprite, bounds.x, bounds.y);

		ctx.restore();
	}

}