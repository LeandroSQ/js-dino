/* eslint-disable max-statements */
import { Optional } from "./../types/optional";
import { Main } from "../main";
import { Rectangle } from "./rectangle";
import { Log } from "../utils/log";
import { Theme } from "../utils/theme";
import { FONT_FAMILY, FONT_SIZE } from "../constants";


export class Analytics {

	private readonly padding = 10;
	private readonly lineHeight = 12;
	private readonly maxEntries = 200;

	private targetFPS = 60;

	private lastFrameTime = 0;
	private frameTimer = 0;
	private frameCount = 0;
	private updateCount = 0;
	private fps = 0;
	private ups = 0;

	private currentMaxHeight = 1;
	private targetMaxHeight = 1;

	private chart: number[] = [];

	constructor(private main: Main) { }

	public async setup() {
		try {
			this.targetFPS = await window.getRefreshRate();
			Log.info("Analytics", `Target FPS: ${this.targetFPS}`);
		} catch (e) {
			Log.warn("Analytics", "Failed to get refresh rate, defaulting to 60 FPS");
		}
	}

	public clear() {
		this.chart = [];
	}

	public endUpdate() {
		this.updateCount++;
	}

	public startFrame(time: Optional<DOMHighResTimeStamp> = null) {
		this.lastFrameTime = time ?? performance.now();
	}

	public endFrame() {
		const elapsed = performance.now() - this.lastFrameTime;
		this.frameCount++;
		this.chart.push(elapsed);

		if (this.chart.length > this.maxEntries) {
			this.chart.shift();
		}
	}

	private calculateBounds(): Rectangle {
		const padding = 15;
		const width = 200;
		const height = 125;

		const x = padding;
		const y = padding;

		return new Rectangle(x, y, width, height);
	}

	private renderBackground(ctx: CanvasRenderingContext2D, bounds: Rectangle) {
		ctx.fillStyle = Theme.containerBackground;
		ctx.strokeStyle = Theme.containerBorder;
		ctx.lineWidth = 0.5;

		ctx.save();
		ctx.beginPath();
		ctx.shadowColor = Theme.containerShadow;
		ctx.shadowBlur = 25;
		ctx.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, 10);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}

	private renderDebugOverlay(ctx: CanvasRenderingContext2D, bounds: Rectangle, average: number, max: number, last: number) {
		const x = bounds.x + this.padding;
		let y = bounds.y + this.padding;

		ctx.fillStyle = Theme.foreground;
		ctx.font = `${FONT_SIZE * 0.25}px ${FONT_FAMILY}`;
		ctx.textBaseline = "top";

		// Render the title
		ctx.textAlign = "center";
		ctx.fillText("Analytics", bounds.x + bounds.width / 2, y);
		y += this.lineHeight + this.padding / 2;

		// Render the values
		ctx.textAlign = "left";
		ctx.fillText(`FPS: ${this.fps} real / ${Math.floor(1000.0 / max)} max est.`, x, y);
		y += this.lineHeight;
		ctx.fillText(`UPS: ${this.ups}`, x, y);
		y += this.lineHeight;
		ctx.fillText(`Average: ${Math.prettifyElapsedTime(average)}`, x, y);
		y += this.lineHeight;
		ctx.fillText(`Max: ${Math.prettifyElapsedTime(max)}`, x, y);
		y += this.lineHeight;
		ctx.fillText(`Last: ${Math.prettifyElapsedTime(last)}`, x, y);
		y += this.lineHeight;
	}

	private renderChart(ctx: CanvasRenderingContext2D, bounds: Rectangle, max: number, reference: number) {
		const chartX = bounds.x;
		const chartY = bounds.y + this.padding + this.lineHeight * 4.5;
		const maxHeight = bounds.y + bounds.height - chartY - this.padding;
		const width = bounds.width + 1;
		const spacing = width / this.maxEntries;

		// Render the chart
		ctx.strokeStyle = Theme.secondary;
		ctx.beginPath();
		const logMax = Math.max(max, 0);
		for (let i = 0; i < this.chart.length; i++) {
			const value = Math.max(this.chart[i], 0);
			const peak = value / logMax * maxHeight;
			const x = chartX + i * spacing;
			const y = chartY + maxHeight - peak;

			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		ctx.stroke();

		// Draw the reference line
		if (max <= reference) return;

		const referenceHeight = reference / max * maxHeight;
		ctx.strokeStyle = "#F00";
		ctx.beginPath();
		ctx.moveTo(chartX, chartY + maxHeight - referenceHeight);
		ctx.lineTo(chartX + width, chartY + maxHeight - referenceHeight);
		ctx.stroke();
	}

	public update(deltaTime: number) {
		this.frameTimer += deltaTime;
		if (this.frameTimer >= 1.0) {
			this.frameTimer -= 1.0;
			this.fps = this.frameCount;
			this.frameCount = 0;
			this.ups = this.updateCount;
			this.updateCount = 0;
		}

		this.currentMaxHeight = Math.lerp(this.currentMaxHeight, this.targetMaxHeight, deltaTime);
	}

	public render(ctx: CanvasRenderingContext2D) {
		ctx.save();

		const bounds = this.calculateBounds();

		this.renderBackground(ctx, bounds);

		// Calculate the max and average frame time
		const targetFrameTime = 1000 / this.targetFPS;
		let maxFrameTime = 0;
		let totalFrameTime = 0;
		let last = 0;
		for (const entry of this.chart) {
			if (entry > maxFrameTime) maxFrameTime = entry;
			totalFrameTime += entry;
			last = entry;
		}
		const averageFrameTime = totalFrameTime / this.chart.length;
		this.targetMaxHeight = maxFrameTime;

		this.renderDebugOverlay(ctx, bounds, averageFrameTime, maxFrameTime, last);

		if (this.chart.length < 2) return;
		this.renderChart(ctx, bounds, this.currentMaxHeight, targetFrameTime);

		ctx.restore();
	}

}