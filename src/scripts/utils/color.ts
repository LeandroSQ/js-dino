export abstract class Color {

	public static alpha(color: string, alpha: number): string {
		let c = color;

		// Removes the # if present
		if (c.startsWith("#")) c = c.slice(1);

		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		if (c.length === 3) c = c.replace(/./g, "$&$&");

		const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, "0");

		return `#${c}${alphaHex}`;
	}

	public static interpolate(current: string, target: string, step: number): string {
		// Remove the # if present
		let tmpCurrent = `0x${current.trim().slice(1)}`;
		let tmpTarget = `0x${target.trim().slice(1)}`;

		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		if (tmpCurrent.length < 5) tmpCurrent = tmpCurrent.replace(/./g, "$&$&");
		if (tmpTarget.length < 5) tmpTarget = tmpTarget.replace(/./g, "$&$&");

		// Convert to integer
		const currentColor = parseInt(tmpCurrent, 16);
		const targetColor = parseInt(tmpTarget, 16);

		// Decode the color channels
		const r1 = currentColor >> 16;
		const g1 = (currentColor >> 8) & 255;
		const b1 = currentColor & 255;

		const r2 = targetColor >> 16;
		const g2 = (targetColor >> 8) & 255;
		const b2 = targetColor & 255;

		// Interpolate
		const r = Math.round(r1 + (r2 - r1) * step);
		const g = Math.round(g1 + (g2 - g1) * step);
		const b = Math.round(b1 + (b2 - b1) * step);

		// Encode back to hex
		const hex = `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

		return hex;
	}

	public static isColorLight(hex: string): boolean {
		// Remove the # if present
		let tmp = `0x${hex.trim().slice(1)}`;

		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		if (tmp.length < 5) tmp = tmp.replace(/./g, "$&$&");

		// Convert to integer
		const color = parseInt(tmp, 16);

		// Decode the color channels
		const r = color >> 16;
		const g = (color >> 8) & 255;
		const b = color & 255;

		// HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
		const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

		return hsp > 127.5;
	}

}