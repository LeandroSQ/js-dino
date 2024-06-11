/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const { src, dest, series, parallel, watch } = require("gulp");
const browserSync = require("browser-sync").create();
const del = require("del");
const htmlMinify = require("gulp-htmlmin");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require("sass"));
const gulpEsbuild = require("gulp-esbuild").createGulpEsbuild({ incremental: false, piping: true });
const cssAutoPrefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");

// Utilities
function isArgumentPassed(...args) {
	for (let i = 0; i < args.length; i++) {
		if (!args[i].startsWith("--")) {
			if (args[i].length > 1) {
				args.unshift(`--${args[i]}`);
			} else {
				args.unshift(`-${args[i]}`);
			}

			i++;
		}
	}

	for (const key of args) {
		if (process.argv.includes(key)) return true;
		if (!key.startsWith("-") && key.toUpperCase() in process.env) return true;
	}

	return false;
}

// Env
const isProduction = isArgumentPassed("production", "prod");
const shouldMinify = true;
console.log(isProduction ? "PRODUCTION" : "DEVELOPMENT");

// Options
const browserSyncOptions = {
	open: false,
	browser: false,
	ui: false,
	host: "0.0.0.0",
	server: {
		baseDir: "./dist",
		port: 3000,
	},
};

const esbuildOptions = {
	outfile: "bundle.js",
	bundle: true,
	sourcemap: isProduction ? undefined : "both",
	target: [
		"es2015",
		"chrome58",
		"edge18",
		"firefox57",
		"node12",
		"safari11"
	],
	platform: "browser",
	minify: shouldMinify,
	minifyWhitespace: shouldMinify,
	minifyIdentifiers: shouldMinify,
	minifySyntax: shouldMinify,
	treeShaking: true,
	define: {
		DEBUG: !isProduction,
	}
};

const htmlOptions = {
	collapseWhitespace: true,
	removeComments: true,
	removeRedundantAttributes: true,
};

const cssOptions = {
	outputStyle: "compressed",
	sourceComments: false,
	sourceMap: false,
};

// Tasks
function reloadBrowsers() {
	return browserSync.reload({ stream: true });
}

function clean() {
	return del("dist");
}

function initializeBrowserSync() {
	return browserSync.init(browserSyncOptions);
}

function handleHtml() {
	return src("src/**/*.html").pipe(htmlMinify(htmlOptions)).pipe(dest("./dist")).pipe(reloadBrowsers());
}

function watchHtml() {
	return watch("src/**/*.html", handleHtml);
}

function handleTs() {
	return src("./src/scripts/main.ts")
		.pipe(gulpEsbuild(esbuildOptions))
		.pipe(dest("./dist/scripts"))
		.pipe(reloadBrowsers());
}

function watchTs() {
	return watch("src/scripts/**/*.ts", handleTs);
}

function handleAssets() {
	return src("./src/assets/**/**.*").pipe(dest("./dist/assets")).pipe(reloadBrowsers());
}

function handleFavicon() {
	return src("./src/assets/favicon/**.*").pipe(dest("./dist"));
}

function watchAssets() {
	return watch("./src/assets/**/**.*", series(handleAssets, handleFavicon));
}

function handleSCSS() {
	return src("./src/styles/**.scss")
		.pipe(sourcemaps.init())
		.pipe(sass(cssOptions).on("error", sass.logError))
		.pipe(cssAutoPrefixer())
		.pipe(concat("style.min.css"))
		.pipe(sourcemaps.write("./"))
		.pipe(dest("./dist/styles"))
		.pipe(reloadBrowsers());
}

function watchSCSS() {
	return watch("./src/styles/**.scss", handleSCSS);
}

// Export tasks
module.exports.assets = handleAssets;
module.exports.html = handleHtml;
module.exports.js = handleTs;
module.exports.scss = handleSCSS;
module.exports.clean = clean;
module.exports.build = series(clean, parallel(handleAssets, handleSCSS, handleHtml, handleTs, handleFavicon));
module.exports.dev = series(module.exports.build, parallel(watchAssets, watchSCSS, watchHtml, watchTs, initializeBrowserSync));
module.exports.default = module.exports.build;