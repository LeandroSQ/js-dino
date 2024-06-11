import { LONG_PRESS } from "../constants";
import { Main } from "../main";
import { Vector } from "../models/vector";
import { Log } from "../utils/log";
import { Dictionary } from "../types/dictionary";
import { InputState } from "../types/input-state.ts";
import { Key } from "../types/key";
import { MouseButton } from "../types/mouse-button";
import { Optional } from "../types/optional.ts";
import { GamepadButton } from "../types/gamepad-button.ts";

export abstract class InputHandler {

	private static invalidated = false;
	private static readonly VERBOSE_KEYBOARD = false as const;
	private static readonly VERBOSE_MOUSE = false as const;
	private static readonly VERBOSE_GAMEPAD = true as const;

	public static get isDirty() {
		return this.invalidated;
	}

	// #region Keyboard
	private static keys: Dictionary<InputState> = {};

	// #region API
	public static isKeyDown(...keys: Key[]): boolean {
		return keys.some(key => this.keys[key]?.active);
	}

	public static isKeyUp(...keys: Key[]): boolean {
		return keys.some(key => !this.keys[key]?.active);
	}

	public static isKeyJustPressed(...keys: Key[]): boolean {
		return keys.some(key => this.keys[key]?.justPressed);
	}

	public static isKeyJustReleased(...keys: Key[]): boolean {
		return keys.some(key => this.keys[key]?.justReleased);
	}

	public static isKeyLongPressed(...keys: Key[]): boolean {
		return keys.some(key => this.keys[key]?.longPress);
	}

	public static isKeyShortPressed(...keys: Key[]): boolean {
		return keys.some(key => this.keys[key]?.shortPress);
	}
	// #endregion

	// #region Event handlers
	private static onKeyDown(event: KeyboardEvent) {
		if (event.repeat) return;
		if (!Object.values(Key).includes(event.key as Key)) return;

		if (this.VERBOSE_KEYBOARD) Log.debug("Input", `Key down: ${event.key}`);

		this.keys[event.key] = {
			active: true,
			lastChange: Date.now(),
			lastTrigger: Date.now(),

			justPressed: true,
			justReleased: false,
			longPress: false,
			shortPress: false
		};

		this.invalidated = true;
	}

	private static onKeyUp(event: KeyboardEvent) {
		if (event.repeat) return;
		if (!Object.values(Key).includes(event.key as Key)) return;

		if (this.VERBOSE_KEYBOARD) Log.debug("Input", `Key up: ${event.key}`);

		const obj = this.keys[event.key];
		if (!obj) return;
		obj.active = false;
		obj.lastChange = Date.now();
		obj.justPressed = false;
		obj.justReleased = true;
		const elapsed = obj.lastChange - obj.lastTrigger;
		obj.longPress = elapsed >= LONG_PRESS;
		obj.shortPress = !obj.longPress;

		this.invalidated = true;
	}

	private static updateKeyboard() {
		for (const key in this.keys) {
			if (!this.keys.hasOwnProperty(key)) continue;

			const obj = this.keys[key];
			obj.justReleased = false;
			obj.justPressed = false;
			obj.shortPress = false;
			obj.longPress = obj.active && Date.now() - obj.lastChange >= LONG_PRESS;
		}
	}
	// #endregion
	// #endregion

	// #region Mouse and pointers
	public static readonly mouse = Vector.zero;
	public static readonly mouseDelta = Vector.zero;
	public static readonly mouseButtons: Dictionary<InputState> = {};

	// #region API
	public static isMouseButtonDown(...buttons: MouseButton[]): boolean {
		return buttons.some(button => this.mouseButtons[button]?.active);
	}

	public static isMouseButtonUp(...buttons: MouseButton[]): boolean {
		return buttons.some(button => !this.mouseButtons[button] || !this.keys[button].active);
	}

	public static isMouseButtonJustPressed(...buttons: MouseButton[]): boolean {
		return buttons.some(button => this.mouseButtons[button]?.justPressed);
	}

	public static isMouseButtonJustReleased(...buttons: MouseButton[]): boolean {
		return buttons.some(button => this.mouseButtons[button]?.justReleased);
	}

	public static isMouseButtonLongPressed(...buttons: MouseButton[]): boolean {
		return buttons.some(button => this.mouseButtons[button]?.longPress);
	}

	public static isMouseButtonShortPressed(...buttons: MouseButton[]): boolean {
		return buttons.some(button => this.mouseButtons[button]?.shortPress);
	}
	// #endregion

	// #region Event handlers
	private static onMouseMove(event: MouseEvent) {
		if (this.VERBOSE_MOUSE) Log.debug("Input", `Mouse move: ${event.clientX}, ${event.clientY}`);

		this.mouseDelta.x = event.movementX;
		this.mouseDelta.y = event.movementY;

		this.mouse.x = event.clientX - ((event.target as HTMLElement)?.offsetLeft ?? 0);
		this.mouse.y = event.clientY - ((event.target as HTMLElement)?.offsetTop ?? 0);
	}

	private static onMouseDown(event: MouseEvent) {
		if (!Object.values(MouseButton).includes(event.button as MouseButton)) return;

		if (this.VERBOSE_MOUSE) Log.debug("Input", `Mouse down: ${event.button}`);

		this.mouseButtons[event.button] = {
			active: true,
			lastChange: Date.now(),
			lastTrigger: Date.now(),

			justPressed: true,
			justReleased: false,
			longPress: false,
			shortPress: false
		};

		this.invalidated = true;
	}

	private static onMouseUp(event: MouseEvent) {
		if (!Object.values(MouseButton).includes(event.button as MouseButton)) return;

		if (this.VERBOSE_MOUSE) Log.debug("Input", `Mouse up: ${event.button}`);

		const obj = this.mouseButtons[event.button];
		if (!obj) return;
		obj.active = false;
		obj.lastChange = Date.now();
		obj.justPressed = false;
		obj.justReleased = true;
		const elapsed = obj.lastChange - obj.lastTrigger;
		obj.longPress = elapsed >= LONG_PRESS;
		obj.shortPress = !obj.longPress;

		this.invalidated = true;
	}

	private static onPointerDown(element: HTMLElement, event: PointerEvent) {
		if (!Object.values(MouseButton).includes(event.button as MouseButton)) return;
		element.setPointerCapture(event.pointerId);

		this.onMouseDown(event);
	}

	private static onPointerUp(element: HTMLElement, event: PointerEvent) {
		if (!Object.values(MouseButton).includes(event.button as MouseButton)) return;
		element.releasePointerCapture(event.pointerId);

		this.onMouseUp(event);
	}

	private static updateMouse() {
		for (const button in this.mouseButtons) {
			if (!this.mouseButtons.hasOwnProperty(button)) continue;

			const obj = this.mouseButtons[button];
			obj.justReleased = false;
			obj.justPressed = false;
			obj.shortPress = false;
			obj.longPress = obj.active && Date.now() - obj.lastChange >= LONG_PRESS;
		}

		this.mouseDelta.x = 0;
		this.mouseDelta.y = 0;
	}
	// #endregion
	// #endregion

	// #region Gamepad
	private static gamepad: Optional<Gamepad> = null;
	private static readonly gamepadButtons: Dictionary<InputState> = {};
	private static isFirstGamepadConnection = true;
	private static gamepadPollingIntervalHandle = -1;

	// #region API
	public static isGamepadButtonDown(...buttons: GamepadButton[]): boolean {
		return buttons.some(button => this.gamepadButtons[button]?.active === true);
	}

	public static isGamepadButtonUp(...buttons: GamepadButton[]): boolean {
		return buttons.some(button => this.gamepadButtons[button]?.active === true);
	}

	public static isGamepadButtonJustPressed(...buttons: GamepadButton[]): boolean {
		return buttons.some(button => this.gamepadButtons[button]?.justPressed === true);
	}

	public static isGamepadButtonJustReleased(...buttons: GamepadButton[]): boolean {
		return buttons.some(button => this.gamepadButtons[button]?.justReleased === true);
	}

	public static isGamepadButtonLongPressed(...buttons: GamepadButton[]): boolean {
		return buttons.some(button => this.gamepadButtons[button]?.longPress === true);
	}

	public static isGamepadButtonShortPressed(...buttons: GamepadButton[]): boolean {
		return buttons.some(button => this.gamepadButtons[button]?.shortPress === true);
	}
	// #endregion

	// #region Event handlers
	private static onGamepadConnected(event: GamepadEvent) {
		if (this.VERBOSE_GAMEPAD) Log.info("Input", `Gamepad connected: ${event.gamepad.id}`);
		this.gamepad = event.gamepad;

		if (this.isFirstGamepadConnection) {
			this.isFirstGamepadConnection = false;
			this.invalidated = true;
		}
	}

	private static onGamepadDisconnected(event: GamepadEvent) {
		if (this.VERBOSE_GAMEPAD) Log.info("Input", `Gamepad disconnected: ${event.gamepad.id}`);
		this.gamepad = null;
	}

	private static onGamepadPoll() {
		const gamepad = navigator.getGamepads().find(x => x);
		if (!gamepad) return;

		if (this.VERBOSE_GAMEPAD) Log.debug("Input", `Gamepad found: ${gamepad.id}`);
		this.gamepad = gamepad;

		if (this.isFirstGamepadConnection) {
			this.isFirstGamepadConnection = false;
			this.invalidated = true;
		}

		clearInterval(this.gamepadPollingIntervalHandle);
	}

	private static requestGamepadPoll() {
		this.gamepadPollingIntervalHandle = setInterval(this.onGamepadPoll.bind(this), 500) as unknown as number;
	}

	private static pollForConnectedGamepad() {
		const gamepad = navigator.getGamepads().find(x => x && x.id === this.gamepad?.id);
		if (gamepad) {
			this.gamepad = gamepad;
		} else {
			if (this.VERBOSE_GAMEPAD) Log.info("Input", `Gamepad disconnected: ${this.gamepad?.id}`);
			this.gamepad = null;
			this.requestGamepadPoll();
		}
	}

	// eslint-disable-next-line max-statements
	private static updateGamepads() {
		if (!this.gamepad) return;

		// Check if this browser requires polling
		if (!("ongamepadconnected" in window)) this.pollForConnectedGamepad();

		// Check if the gamepad had any changes
		if (this.gamepad) {
			for (let i = 0; i < this.gamepad.buttons.length; i++) {
				const button = this.gamepad.buttons[i];
				const state = this.gamepadButtons[i];
				if (button.pressed !== state.active) {
					this.invalidated = true;
					if (button.pressed) {// On button down
						state.active = true;
						state.lastChange = Date.now();
						state.justPressed = true;
						state.justReleased = false;
						state.lastTrigger = Date.now();
						state.longPress = false;
						state.shortPress = false;
					} else {// On button up
						state.active = false;
						state.lastChange = Date.now();
						state.justPressed = false;
						state.justReleased = true;
						const elapsed = state.lastChange - state.lastTrigger;
						state.longPress = elapsed >= LONG_PRESS;
						state.shortPress = !state.longPress;
					}
				} else {// Button state hasn't changed
					state.justReleased = false;
					state.justPressed = false;
					state.shortPress = false;
					state.longPress = state.active && Date.now() - state.lastChange >= LONG_PRESS;
				}
			}
		}
	}
	// #endregion
	// #endregion

	// #region Input mapping
	public static isShortJumping() {
		return this.isKeyShortPressed(Key.Space, Key.ArrowUp)
			|| this.isMouseButtonShortPressed(MouseButton.Left)
			|| this.isGamepadButtonShortPressed(GamepadButton.A, GamepadButton.Up);
	}

	public static isLongJumping() {
		return this.isKeyLongPressed(Key.Space, Key.ArrowUp)
			|| this.isMouseButtonLongPressed(MouseButton.Left)
			|| this.isGamepadButtonLongPressed(GamepadButton.A, GamepadButton.Up);
	}

	public static isCrouching() {
		return this.isKeyDown(Key.ArrowDown)
			|| this.isMouseButtonDown(MouseButton.Right)
			|| this.isGamepadButtonDown(GamepadButton.Down, GamepadButton.B);
	}
	// #endregion

	public static vibrate() {
		if (navigator.vibrate) navigator.vibrate(200);
		if (this.gamepad?.vibrationActuator) {
			this.gamepad.vibrationActuator.playEffect("dual-rumble", {
				duration: 100,
				strongMagnitude: 0.5,
				weakMagnitude: 0.25
			});

		}
	}

	public static setup(main: Main) {
		// Keyboard
		window.addEventListener("keydown", this.onKeyDown.bind(this));
		window.addEventListener("keyup", this.onKeyUp.bind(this));

		// Mouse
		this.mouse.x = window.innerWidth / 2;
		this.mouse.y = window.innerHeight / 2;
		main.canvas.element.addEventListener("click", this.onMouseMove.bind(this));
		main.canvas.element.addEventListener("mousemove", this.onMouseMove.bind(this));
		main.canvas.element.addEventListener("mousedown", this.onMouseDown.bind(this));
		main.canvas.element.addEventListener("mouseup", this.onMouseUp.bind(this));

		// Pointer
		main.canvas.element.addEventListener("pointermove", this.onMouseMove.bind(this));
		main.canvas.element.addEventListener("pointerdown", this.onPointerDown.bind(this, main.canvas.element));
		main.canvas.element.addEventListener("pointerup", this.onPointerUp.bind(this, main.canvas.element));

		// Gamepad
		if ("getGamepads" in navigator) {
			if ("ongamepadconnected" in window) {
				window.addEventListener("gamepadconnected", this.onGamepadConnected.bind(this));
				window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected.bind(this));
			} else {
				// Chrome doesn't support the gamepadconnected event
				this.requestGamepadPoll();
			}

			for (const button of Object.values(GamepadButton)) {
				this.gamepadButtons[button] = {
					active: false,
					lastChange: Date.now(),
					lastTrigger: Date.now(),

					justPressed: false,
					justReleased: false,
					longPress: false,
					shortPress: false
				};
			}
		}
	}

	public static update() {
		this.invalidated = false;
		this.updateKeyboard();
		this.updateGamepads();
		this.updateMouse();
	}

}