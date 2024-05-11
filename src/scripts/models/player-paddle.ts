import { PADDLE_SPEED } from "../constants";
import { Size } from "../types/size";
import { InputHandler, Key } from "./../components/input-handler";
import { Paddle } from "./paddle";

export class PlayerPaddle extends Paddle {

	private enableMouse = true;

	constructor(position) {
		super(position);
	}

	public update(deltaTime: number, screen: Size) {
		if (InputHandler.mouseDelta.x !== 0) {
			this.bounds.x += ((InputHandler.mouse.x - this.bounds.width / 2) - this.bounds.x);
			if (this.bounds.x < 0) {
				this.bounds.x = 0;
			} else if (this.bounds.x + this.bounds.width > screen.width) {
				this.bounds.x = screen.width - this.bounds.width;
			}
		} else {
			if (InputHandler.isKeyDown(Key.ArrowLeft)) {
				this.bounds.x -= PADDLE_SPEED * deltaTime;
				if (this.bounds.x < 0) {
					this.bounds.x = 0;
				}
			}

			if (InputHandler.isKeyDown(Key.ArrowRight)) {
				this.bounds.x += PADDLE_SPEED * deltaTime;
				if (this.bounds.x + this.bounds.width > screen.width) {
					this.bounds.x = screen.width - this.bounds.width;
				}
			}
		}
	}

}