/* eslint-disable no-unused-vars */
import { Main } from "../main";
import { Vector } from "../models/vector";

export enum Key {
	ArrowUp = "ArrowUp",
	ArrowDown = "ArrowDown",
	ArrowLeft = "ArrowLeft",
	ArrowRight = "ArrowRight",
	Space = " ",
	Escape = "Escape"
}

export enum MouseButton {
	Left = 0,
	Middle = 1,
	Right = 2
}

type Dictionary<T> = { [key: string]: T };

export class InputHandler {

	public static isDirty = false;

	// #region Keyboard
	private static keys: Dictionary<boolean> = { };
	private static keysJustPressed: Dictionary<boolean> = { };

	// method for checking if 1:n keys are pressed
	public static isKeyDown(...keys: Key[]) {
		return keys.some(key => this.keys[key]);
	}

	// method for checking if 1:n keys were just pressed
	public static isKeyJustPressed(...keys: Key[]) {
		return keys.some(key => this.keysJustPressed[key]);
	}

	// #region Event listeners
	public static onKeyDown(event: KeyboardEvent) {
		this.keys[event.key] = true;
		this.keysJustPressed[event.key] = true;

		this.isDirty = true;
	}

	public static onKeyUp(event: KeyboardEvent) {
		this.keys[event.key] = false;
		delete this.keysJustPressed[event.key];

		this.isDirty = true;
	}
	// #endregion
	// #endregion

	// #region Mouse
	public static readonly mouse = Vector.zero;
	public static readonly mouseDelta = Vector.zero;
	public static readonly mouseButtons: Dictionary<boolean> = { };
	public static mouseButtonsJustPressed: Dictionary<boolean> = { };
	public static mouseButtonsJustReleased: Dictionary<boolean> = { };

	// method for checking if 1:n mouse buttons are pressed
	public static isMouseButtonDown(...buttons: MouseButton[]) {
		return buttons.some(button => this.mouseButtons[button]);
	}

	// method for checking if 1:n mouse buttons were just pressed
	public static isMouseButtonJustPressed(...buttons: MouseButton[]) {
		return buttons.some(button => this.mouseButtonsJustPressed[button]);
	}

	// method for checking if 1:n mouse buttons were just released
	public static isMouseButtonJustReleased(...buttons: MouseButton[]) {
		return buttons.some(button => this.mouseButtonsJustReleased[button]);
	}

	// #region Event listeners
	public static onMouseMove(event: MouseEvent) {
		this.mouseDelta.x = event.movementX;
		this.mouseDelta.y = event.movementY;

		this.mouse.x = event.clientX - ((event.target as HTMLElement)?.offsetLeft ?? 0);
		this.mouse.y = event.clientY - ((event.target as HTMLElement)?.offsetTop ?? 0);

		this.isDirty = true;
	}

	public static onMouseDown(event: MouseEvent) {
		this.mouseButtons[event.button] = true;
		this.mouseButtonsJustPressed[event.button] = true;

		this.isDirty = true;
	}

	public static onMouseUp(event: MouseEvent) {
		this.mouseButtons[event.button] = false;
		this.mouseButtonsJustReleased[event.button] = true;

		this.isDirty = true;
	}

	public static onPointerDown(element: HTMLElement, event: PointerEvent) {
		console.log("Pointer down", event);
		this.mouseButtons[event.button] = true;
		this.mouseButtonsJustPressed[event.button] = true;

		element.setPointerCapture(event.pointerId);

		this.isDirty = true;
	}

	public static onPointerUp(element: HTMLElement, event: PointerEvent) {
		console.log("Pointer up", event);
		this.mouseButtons[event.button] = false;
		this.mouseButtonsJustReleased[event.button] = true;

		element.releasePointerCapture(event.pointerId);

		this.isDirty = true;
	}
	// #endregion
	// #endregion

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
	}

	public static update() {
		this.keysJustPressed = { };
		this.mouseButtonsJustPressed = { };
		this.mouseButtonsJustReleased = {  };
		this.mouseDelta.x = 0;
		this.mouseDelta.y = 0;
		this.isDirty = false;
	}

}