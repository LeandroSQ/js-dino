import { CLOUD_COUNT, CLOUD_SPAWN_INTERVAL } from "../constants";
import { Main } from "../main";
import { Log } from "../utils/log";
import { SpriteSheet } from "../utils/spritesheet";
import { Cloud } from "./cloud";
import { Vector } from "./vector";

export class CloudSpawner {

	private cloudSpawnTimer = 0;

	constructor(private main: Main) { }

	setup() {
		// Spawn initial clouds
		for (let i = 0; i < CLOUD_COUNT / 2; i++) {
			const position = new Vector(Math.random() * this.main.screen.width, Math.random() * this.main.screen.height / 2);
			this.main.clouds.push(new Cloud(position, this.main));
		}
	}

	update(deltaTime: number) {
		this.cloudSpawnTimer += deltaTime;
		if (this.main.clouds.length < CLOUD_COUNT && this.cloudSpawnTimer >= CLOUD_SPAWN_INTERVAL) {
			this.cloudSpawnTimer = 0;
			// Ensure that it is not touching other clouds
			const position = new Vector(this.main.screen.width + 1, Math.random() * this.main.screen.height / 2);
			let isValidPosition = true;
			for (const cloud of this.main.clouds) {
				// Check if the cloud is on the same y level as the new cloud
				if (Math.abs(cloud.position.y - position.y) < SpriteSheet.cloud.height) {
					isValidPosition = false;
					break;
				}
			}
			if (isValidPosition) {
				Log.debug("StatePlay", "Spawning cloud at", position.toString());
				this.main.clouds.push(new Cloud(position, this.main));
			}
		}
	}

}