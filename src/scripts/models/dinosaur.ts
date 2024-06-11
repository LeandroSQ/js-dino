import { InputHandler } from "../components/input-handler";
import { Key } from "../types/key";
import { MouseButton } from "../types/mouse-button";
import { DINO_FALL_FORCE, DINO_GRAVITY, DINO_INVULNERABILITY_DURATION, DINO_JUMP_FORCE, DINO_SPRITE_SWITCH_INTERVAL, MARGIN, MOBILE_SPEED_FACTOR } from "../constants";
import { StatePlay } from "../states/state-play";
import { AEntity } from "../types/entity";
import { Gizmo } from "../utils/gizmo";
import { Log } from "../utils/log";
import { SpriteSheet } from "../utils/spritesheet";
import { Rectangle } from "./rectangle";
import { AudioUtils } from "../utils/audio";
import { SoundFX } from "../types/soundfx";
import { Theme } from "../utils/theme";
import { StateGameOver } from "../states/state-game-over";

export class Dinosaur extends AEntity {

	private spriteTimer = 0;
	protected isCrouching = false;

	constructor(protected state: StatePlay) {
		super();

		this.position.x = MARGIN;
		this.position.y = this.state.height - SpriteSheet.ground.height - this.sprite.height + SpriteSheet.groundOffset;
	}

	protected get groundHeight() {
		const height = this.isCrouching ? SpriteSheet.dinoCrouch1.height : SpriteSheet.dino0.height;

		return this.state.height - SpriteSheet.ground.height - height + SpriteSheet.groundOffset;
	}

	protected get isGrounded() {
		return this.velocity.y >= 0 && this.position.y >= this.groundHeight;
	}

	public get sprite() {
		if (this.state instanceof StateGameOver) {
			return SpriteSheet.dino4;
		}

		if (this.isGrounded)
			if (this.isCrouching)
				return this.spriteTimer < DINO_SPRITE_SWITCH_INTERVAL ? SpriteSheet.dinoCrouch2 : SpriteSheet.dinoCrouch1;
			else
				return this.spriteTimer < DINO_SPRITE_SWITCH_INTERVAL ? SpriteSheet.dino3 : SpriteSheet.dino2;
		else
			return SpriteSheet.dino0;
	}

	public get bounds() {
		const sprite = this.sprite;

		return new Rectangle(this.position.x, this.position.y, sprite.width, sprite.height);
	}


	private updateInvulnerability(deltaTime: number) {
		if (this.state.isInvulnerable) {
			this.state.invulnerabilityTimer += deltaTime;
			if (this.state.invulnerabilityTimer >= DINO_INVULNERABILITY_DURATION) {
				this.state.isInvulnerable = false;
				this.state.invulnerabilityTimer = 0;
			}
		}
	}

	protected updateInput() {
		// Crouch
		if (InputHandler.isCrouching()) {
			if (this.isGrounded) {
				this.isCrouching = true;
				this.position.y = this.groundHeight;
			} else {
				this.isCrouching = false;
				this.acceleration.y += DINO_FALL_FORCE;
			}
		} else {
			this.isCrouching = false;

			// Jump
			if (this.isGrounded) {
				if (InputHandler.isShortJumping()) {
					Log.debug("Input", "Regular jump!");
					this.jump(1.0);
				} else if (InputHandler.isLongJumping()) {
					Log.debug("Input", "Long jump!");
					this.jump(1.25);
				}
			}
		}
	}

	protected jump(scalar = 1.0) {
		if (this.isGrounded) {
			Log.debug("Dino", "Jumping!");

			this.acceleration.y = DINO_JUMP_FORCE * scalar;

			AudioUtils.play(SoundFX.Jump);
		}
	}

	private applyConstraints() {
		if (this.position.y >= this.groundHeight) {
			this.position.y = this.groundHeight;
			this.velocity.y = 0;
		} else if (this.position.y < 0) {
			this.position.y = 0;
			this.velocity.y = 0;
		}
	}

	public update(deltaTime: number): void {
		this.updateInvulnerability(deltaTime);

		// Update sprite
		this.spriteTimer += deltaTime * this.state.speed;
		if (this.spriteTimer >= DINO_SPRITE_SWITCH_INTERVAL * 2.0) this.spriteTimer -= DINO_SPRITE_SWITCH_INTERVAL * 2.0;

		// Apply gravity
		if (!this.isGrounded) {
			const mobileFactor = window.isMobile() ? MOBILE_SPEED_FACTOR : 1.0;
			if (this.velocity.y < 0) {
				this.acceleration.y = DINO_GRAVITY * mobileFactor;
			} else {
				this.acceleration.y = DINO_FALL_FORCE * mobileFactor;
			}
		}

		this.updateInput();

		// Velocity Verlet integration
		this.position.y += this.velocity.y * deltaTime + 0.5 * this.acceleration.y * Math.pow(deltaTime, 2.0);
		this.velocity.y += this.acceleration.y * deltaTime;


		this.applyConstraints();

		Gizmo.circle(this.position.add(this.bounds.size.divide(2)), 5);
		Gizmo.arrow(this.position.add(this.bounds.size.divide(2)), this.velocity.normalize().multiply(this.sprite.height / 2.0), Theme.secondary);
	}

	public render(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		if (this.state.isInvulnerable) ctx.globalAlpha = Math.oscilate(this.state.main.globalTimer, 2.5, 0.25, 0.75);
		ctx.drawSprite(this.sprite, this.position.x, this.position.y);
		ctx.restore();

		Gizmo.outline(new Rectangle(this.position.x, this.position.y, this.sprite.width, this.sprite.height), "rgba(255, 0, 0, 0.5)");
	}

}