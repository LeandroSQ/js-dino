import { CursorType } from "../types/cursor-type";

export abstract class Cursor {

	private static current: CursorType = CursorType.Default;

	public static set(value: CursorType) {
		this.current = value;
	}

	public static apply() {
		document.body.style.cursor = this.current;
	}

	public static reset() {
		this.current = CursorType.Default;
	}

}