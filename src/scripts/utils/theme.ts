import { Color } from "./color";
import { Log } from "./log";

export abstract class Theme {

	public static background: string;
	public static foreground: string;
	public static secondary: string;
	public static containerBackground: string;
	public static containerBorder: string;
	public static containerShadow: string;

	public static get isDark() {
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	}

	public static async setup() {
		Theme.loadVariables();
		Theme.observeChanges();
	}

	private static loadVariables() {
		// Define the CSS variables to keep track of
		const variables = [
			"--background",
			"--foreground",
			"--secondary",
			"--container-background",
			"--container-border",
			"--container-shadow"
		];

		Log.info("Theme", `Setting up theme, loading ${variables.length} variables...`);

		console.groupCollapsed("Loading theme variables");

		// Iterate trough variables
		const style = getComputedStyle(document.body);
		for (const variable of variables) {
			// Get the variable value
			const value = style.getPropertyValue(variable);
			const name = variable.toString().toCamelCase();

			// Set the variable on this instance
			Theme[name] = value;

			// Print out the variable
			console.log(`%c${name}`, `color: ${Color.isColorLight(value) ? "#212121" : "#eee"}; background-color: ${value}`);

		}

		console.groupEnd();
	}

	private static observeChanges() {
		const darkThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		darkThemeMediaQuery.addEventListener("change", () => {
			Log.info("Theme", `Changed theme to ${darkThemeMediaQuery.matches ? "dark" : "light"}`);

			Theme.loadVariables();
		});
	}

}