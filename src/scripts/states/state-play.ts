import { StateWin } from "./state-win";
import { PlayerPaddle } from "./../models/player-paddle";
import { Main } from "../main";
import { AState } from "./state";
import { Ball } from "../models/ball";
import { Log } from "../utils/log";
import { StateGameOver } from "./state-game-over";
import { Cursor } from "../utils/cursor";
import { CursorType } from "../types/cursor-type";

export class StatePlay extends AState {

	constructor(private main: Main) {
		super();
	}

	// #region Utility
	public get width() {
		return this.main.canvas.width;
	}

	public get height() {
		return this.main.canvas.height;
	}

	public invalidate() {
		this.main.invalidate();
	}
	// #endregion

	async setup() {
		Log.debug("StatePlay", "Setting up...");
		this.main.ball = new Ball(this.main);
		this.main.paddle = new PlayerPaddle(this.main);
		this.main.generateBlocks();
		this.main.reset(true);

		Cursor.set(CursorType.Hidden);
	}

	async update(deltaTime: number) {
		if (this.main.blocks.length <= 0) {
			this.main.setState(new StateWin(this.main));
		} else if (this.main.lives <= 0) {
			this.main.setState(new StateGameOver(this.main));
		}

		this.main.updateEntities(deltaTime);

		this.invalidate();
	}

}