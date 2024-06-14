export abstract class Log {

	private static logColoredText(level: string, tag: string, tagColor: string, ...args: string[]) {
		console[level].call(
			console,
			`%c${level.toUpperCase()} %c[${tag}]`,
			`font-weight: bold; color: ${tagColor};`,
			"font-weight: bold; color: gray",
			...args
		);
	}

	public static info(tag: string, ...args: string[]) {
		this.logColoredText("info", tag, "turquoise", ...args);
	}

	public static warn(tag: string, ...args: string[]) {
		this.logColoredText("warn", tag, "yellow", ...args);
	}

	public static error(tag: string, ...args: string[]) {
		const error = args.find((x: unknown) => x instanceof Error);
		if (error) console.trace(error);

		this.logColoredText("error", tag, "red", ...args);
	}

	public static debug(tag: string, ...args: string[]) {
		if (!DEBUG) return;

		this.logColoredText("debug", tag, "magenta", ...args);
	}

};