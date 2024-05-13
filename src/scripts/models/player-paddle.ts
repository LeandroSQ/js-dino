import { PADDLE_SPEED } from "../constants";
import { Main } from "../main";
import { InputHandler, Key } from "./../components/input-handler";
import { APaddle } from "./paddle";

export class PlayerPaddle extends APaddle {

	constructor(private main: Main) {
		super(main.canvas.size);
	}

	public update(deltaTime: number) {
		if (InputHandler.mouseDelta.x !== 0) {
			this.bounds.x += ((InputHandler.mouse.x - this.bounds.width / 2) - this.bounds.x);
			if (this.bounds.x < 0) {
				this.bounds.x = 0;
			} else if (this.bounds.x + this.bounds.width > this.main.canvas.width) {
				this.bounds.x = this.main.canvas.width - this.bounds.width;
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
				if (this.bounds.x + this.bounds.width > this.main.canvas.width) {
					this.bounds.x = this.main.canvas.width - this.bounds.width;
				}
			}
		}
	}

}