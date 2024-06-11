/* eslint-disable max-nested-callbacks */
import { Main } from "./main";
import { TextAlign } from "./types/text-align";
import { Sprite, SpriteSheet } from "./utils/spritesheet";

declare global {

	interface Window {
		_instance: Main;
		addLoadEventListener: (listener: () => void) => void;
		addVisibilityChangeEventListener: (listener: (isVisible: boolean) => void) => void;
		isDocumentHidden: () => boolean;
		isMobile: () => boolean;
		getRefreshRate: () => Promise<number>;
	}

	interface HTMLCanvasElement {
		screenshot: () => void;
	}

	interface String {
		toCamelCase: () => string;
	}

	interface Array<T> {
		remove: (item: T) => boolean;
		appendArray: (array: Array<T> | undefined) => void;
	}

	interface Math {
		clamp: (value: number, min: number, max: number) => number;
		average: (...values: number[]) => number;
		distance: (x1: number, y1: number, x2: number, y2: number) => number;
		randomInt: (min: number, max: number) => number;
		lerp: (a: number, b: number, t: number) => number;
		oscilate: (time: number, cyclesPerSecond: number, minAmplitude?: number, maxAmplitude?: number) => number;
		smoothstep: (x: number, min?: number, max?: number) => number;
		prettifyElapsedTime: (millis: number) => string;
	}

	interface CanvasRenderingContext2D {
		clear: () => void;
		line: (x1: number, y1: number, x2: number, y2: number) => void;
		fillTextAligned(text: string, x: number, y: number, alignment: TextAlign): void;
		drawSprite(sprite: Sprite, x: number, y: number, width?: number, height?: number): void;
	}

	interface Function {
		oneshot: (predicate: VoidFunction) => VoidFunction;
		timeout: (predicate: VoidFunction, amount: number) => VoidFunction;
		debounce: (predicate: VoidFunction, amount: number) => VoidFunction;
	}

	interface PromiseConstructor {
		delay: (ms: number) => Promise<void>;
	}

	const DEBUG: boolean;

}

// Definitions
window.addLoadEventListener = function (listener) {
	const callback = Function.oneshot(listener);

	window.addEventListener("DOMContentLoaded", callback);
	window.addEventListener("load", callback);
	document.addEventListener("load", callback);
	window.addEventListener("ready", callback);
	setTimeout(callback, 1000);
};

window.addVisibilityChangeEventListener = function (listener) {
	const prefixes = ["webkit", "moz", "ms", ""];

	const callback = Function.debounce(() => {
		listener(!window.isDocumentHidden());
	}, 50);

	prefixes.forEach(prefix => {
		document.addEventListener(`${prefix}visibilitychange`, callback);
	});
	document.onvisibilitychange = callback;
};

window.isMobile = function () {
	return window.matchMedia("(any-pointer: coarse)").matches;
};

window.isDocumentHidden = function () {
	const prefixes = ["webkit", "moz", "ms", ""];

	return prefixes
		.map((x) => (x && x.length > 0 ? `${x}Hidden` : "hidden"))
		.map((x) => document[x]).reduce((a, b) => a || b, false);
};

window.getRefreshRate = function () {
	return new Promise((resolve, _reject) => {
		const knownRefreshRates = [60, 75, 100, 120, 144, 165, 240, 360];

		setTimeout(() => {
			requestAnimationFrame(start => {
				requestAnimationFrame(end => {
					const elapsed = end - start;
					const rate = 1000 / elapsed;

					// Get the closest known refresh rate
					const closest = knownRefreshRates.reduce((a, b) => Math.abs(b - rate) < Math.abs(a - rate) ? b : a);

					resolve(closest);
				});
			});
		}, 0);
	});
};

HTMLCanvasElement.prototype.screenshot = function (filename = "download.png") {
	const a = document.createElement("a");
	a.download = filename;
	a.href = this.toDataURL("image/png;base64");
	a.style.visibility = "hidden";
	a.style.display = "none";
	document.body.appendChild(a);

	setTimeout(() => {
		a.click();
		document.body.removeChild(a);
	}, 100);
};

String.prototype.toCamelCase = function () {
	return this.replace("--", "")
		.replace(/-./g, (x) => x[1].toUpperCase())
		.trim();
};

Array.prototype.remove = function (item) {
	const index = this.indexOf(item);
	if (index != -1) {
		this.splice(index, 1);

		return true;
	}

	return false;
};

Array.prototype.appendArray = function (array) {
	if (!array) return;

	for (let i = 0; i < array.length; i++) {
		this.push(array[i]);
	}
};

Math.clamp = function (value, min, max) {
	return Math.min(Math.max(value, min), max);
};

Math.average = function (...values) {
	return values.reduce((a, b) => a + b, 0) / values.length;
};

Math.distance = function (x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

Math.randomInt = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

Math.lerp = function (a, b, t) {
	/* const diff = b - a;
	if (diff > t) return a + t;
	if (diff < -t) return a - t;

	return a + diff; */

	return a + (b - a) * t;
};

Math.oscilate = function (time, cyclesPerSecond, minAmplitude = 0.0, maxAmplitude = 1.0) {
	// Calculate the angular frequency (in radians per second)
	const angularFrequency = 2 * Math.PI * cyclesPerSecond;

	// Calculate the amplitude range
	const amplitudeRange = maxAmplitude - minAmplitude;

	// Calculate the sine wave value at the given time
	const sineValue = Math.sin(angularFrequency * time);

	// Scale the sine value to the amplitude range
	const scaledValue = (sineValue + 1) / 2; // Shift sine value to [0, 1] range
	const amplitude = minAmplitude + scaledValue * amplitudeRange;

	return amplitude;
};

Math.smoothstep = function (x, min = 0, max = 1) {
	// Scale, bias and saturate x to 0..1 range
	// eslint-disable-next-line no-param-reassign
	x = Math.clamp((x - min) / (max - min), 0, 1);

	// Evaluate polynomial
	return x * x * (3 - 2 * x);
};

Math.prettifyElapsedTime = function (ms) {
	const toFixed = (value, digits) => {
		if (value % 1 === 0) return Math.floor(value);
		else return value.toFixed(digits);
	};

	if (ms < 1) return `${Math.floor(ms * 1000)}μs`;
	if (ms < 1000) return `${toFixed(ms, 2)}ms`;
	if (ms < 60000) return `${toFixed((ms / 1000), 2)}s`;
	if (ms < 3600000) return `${toFixed((ms / 60000), 2)}m`;
	else return `${toFixed((ms / 3600000), 2)}h`;
};

CanvasRenderingContext2D.prototype.clear = function () {
	this.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

CanvasRenderingContext2D.prototype.line = function (x1, y1, x2, y2) {
	this.beginPath();
	this.moveTo(x1, y1);
	this.lineTo(x2, y2);
	this.stroke();
};

CanvasRenderingContext2D.prototype.fillTextAligned = function (text, x, y, alignment) {
	const metrics = this.measureText(text);

	switch (alignment) {
		case TextAlign.Left:
			this.fillText(text, x, y);
			break;
		case TextAlign.Center:
			this.fillText(text, x - metrics.width / 2, y);
			break;
		case TextAlign.Right:
			this.fillText(text, x - metrics.width, y);
			break;
	}
};

CanvasRenderingContext2D.prototype.drawSprite = function (sprite, x, y, width = undefined, height = undefined) {
	this.drawImage(
		SpriteSheet.source,
		sprite.x,
		sprite.y,
		sprite.width,
		sprite.height,
		x,
		y,
		width || sprite.width,
		height || sprite.height
	);
};

Function.oneshot = function (predicate) {
	let fired = false;

	const wrapper = () => {
		if (fired) return;
		fired = true;

		predicate();
	};

	return wrapper;
};

Function.timeout = function (predicate, amount) {
	let fired = false;

	const wrapper = () => {
		if (fired) return;
		fired = true;

		setTimeout(() => {
			predicate();
			fired = false;
		}, amount);
	};

	return wrapper;
};

Function.debounce = function (predicate, amount) {
	let fired = false;

	const wrapper = () => {
		if (fired) return;
		fired = true;

		setTimeout(() => {
			predicate();
			fired = false;
		}, amount);
	};

	return wrapper;
};

Promise.delay = function (amount) {
	return new Promise((resolve, _) => {
		setTimeout(resolve, amount);
	});
};

export { };