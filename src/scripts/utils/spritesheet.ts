import { ImageUtils } from "./image";
import { Theme } from "./theme";

export type Sprite = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export abstract class SpriteSheet {

	private static sourceLight: HTMLImageElement;
	private static sourceDark: HTMLImageElement;

	// #region Sprites
	// #region Ground
	public static readonly ground: Sprite = {
		x: 0,
		y: 104,
		width: 2400,
		height: 26
	} as const;

	public static readonly groundOffset = 14 as const;
	// #endregion

	// #region Dino
	public static readonly dinoIdle: Sprite = {
		x: 76,
		y: 6,
		width: 88,
		height: 92
	} as const;

	public static readonly dino0: Sprite = {
		x: 1339,
		y: 2,
		width: 86,
		height: 94
	} as const;

	public static readonly dino1: Sprite = {
		x: 1427,
		y: 2,
		width: 86,
		height: 94
	} as const;

	public static readonly dino2: Sprite = {
		x: 1515,
		y: 2,
		width: 86,
		height: 94
	} as const;

	public static readonly dino3: Sprite = {
		x: 1603,
		y: 2,
		width: 86,
		height: 94
	} as const;

	public static readonly dino4: Sprite = {
		x: 1691,
		y: 2,
		width: 86,
		height: 94
	} as const;

	public static readonly dino5: Sprite = {
		x: 1782,
		y: 5,
		width: 80,
		height: 87
	} as const;

	public static readonly dinoCrouch1: Sprite = {
		x: 1866,
		y: 36,
		width: 118,
		height: 60
	} as const;

	public static readonly dinoCrouch2: Sprite = {
		x: 1984,
		y: 36,
		width: 118,
		height: 60
	} as const;
	// #endregion

	// #region Pterodactyl
	public static readonly pterodactyl0: Sprite = {
		x: 260,
		y: 2,
		width: 92,
		height: 80
	} as const;

	public static readonly pterodactyl1: Sprite = {
		x: 352,
		y: 2,
		width: 92,
		height: 80
	} as const;
	// #endregion

	// #region Cacti
	public static readonly smallCactus0: Sprite = {
		x: 446,
		y: 2,
		width: 34,
		height: 70
	} as const;

	public static readonly smallCactus1: Sprite = {
		x: 480,
		y: 2,
		width: 34,
		height: 70
	} as const;

	public static readonly smallCactus2: Sprite = {
		x: 514,
		y: 2,
		width: 34,
		height: 70
	} as const;

	public static readonly smallCactus3: Sprite = {
		x: 548,
		y: 2,
		width: 34,
		height: 70
	} as const;

	public static readonly smallCactus4: Sprite = {
		x: 582,
		y: 2,
		width: 34,
		height: 70
	} as const;

	public static readonly smallCactus5: Sprite = {
		x: 616,
		y: 2,
		width: 34,
		height: 70
	} as const;

	public static readonly bigCactus0: Sprite = {
		x: 652,
		y: 2,
		width: 50,
		height: 100
	} as const;

	public static readonly bigCactus1: Sprite = {
		x: 652 + 50 * 1,
		y: 2,
		width: 50,
		height: 100
	} as const;

	public static readonly bigCactus2: Sprite = {
		x: 652 + 50 * 2,
		y: 2,
		width: 50,
		height: 100
	} as const;

	public static readonly bigCactus3: Sprite = {
		x: 652 + 50 * 3,
		y: 2,
		width: 50,
		height: 100
	} as const;

	public static readonly bigCactus4: Sprite = {
		x: 652 + 50 * 4,
		y: 2,
		width: 102,
		height: 100
	} as const;
	// #endregion

	// #region Misc
	public static readonly resetButton: Sprite = {
		x: 2,
		y: 2,
		width: 72,
		height: 64
	} as const;

	public static readonly cloud: Sprite = {
		x: 174,
		y: 2,
		width: 84,
		height: 27
	} as const;
	// #endregion

	// #region Unused
	/* public static readonly digit0: Sprite = {
		x: 971,
		y: 22,
		width: 18,
		height: 21
	} as const;

	public static readonly digit1: Sprite = {
		x: 976,
		y: 22,
		width: 16,
		height: 21
	} as const;

	public static readonly digit2: Sprite = {
		x: 994,
		y: 22,
		width: 18,
		height: 21
	} as const;

	public static readonly digit3: Sprite = {
		x: 1014,
		y: 22,
		width: 18,
		height: 21
	} as const;

	public static readonly digit4: Sprite = {
		x: 1034,
		y: 22,
		width: 18,
		height: 21
	} as const;

	public static readonly digit5: Sprite = {
		x: 1054,
		y: 22,
		width: 18,
		height: 21
	} as const;

	public static readonly digit6: Sprite = {
		x: 1074,
		y: 22,
		width: 18,
		height: 21
	} as const;

	public static readonly digit7: Sprite = {
		x: 1094,
		y: 22,
		width: 18,
		height: 21
	} as const;

	public static readonly digit8: Sprite = {
		x: 1114,
		y: 22,
		width: 18,
		height: 21
	} as const;

	public static readonly digit9: Sprite = {
		x: 1134,
		y: 22,
		width: 18,
		height: 21
	} as const;

	public static readonly letterH: Sprite = {
		x: 1154,
		y: 22,
		width: 18,
		height: 21
	} as const;

	public static readonly letterI: Sprite = {
		x: 1176,
		y: 22,
		width: 16,
		height: 21
	} as const;

	public static readonly letterG: Sprite = {
		x: 954,
		y: 29,
		width: 21,
		height: 21
	} as const;

	public static readonly letterA: Sprite = {
		x: 1002,
		y: 29,
		width: 21,
		height: 21
	} as const;

	public static readonly letterM: Sprite = {
		x: 1050,
		y: 29,
		width: 21,
		height: 21
	} as const;

	public static readonly letterE: Sprite = {
		x: 10098,
		y: 29,
		width: 21,
		height: 21
	} as const;

	public static readonly letterO: Sprite = {
		x: 1170,
		y: 29,
		width: 21,
		height: 21
	} as const;

	public static readonly letterV: Sprite = {
		x: 1218,
		y: 29,
		width: 21,
		height: 21
	} as const;

	public static readonly letterR: Sprite = {
		x: 1314,
		y: 29,
		width: 21,
		height: 21
	} as const; */
	// #endregion
	// #endregion

	static get source() {
		return Theme.isDark ? this.sourceDark : this.sourceLight;
	}

	static async setup() {
		// TODO: Use lazy loading to avoid loading twice
		[this.sourceLight, this.sourceDark] = await Promise.all([
			ImageUtils.load("spritesheet"),
			ImageUtils.load("spritesheet-dark")
		]);
	}

}