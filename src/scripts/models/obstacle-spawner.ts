import { MOBILE_INTERVAL_FACTOR, OBSTACLE_DOUBLE_SPAWN_CHANCE, OBSTACLE_INTERVAL_FACTOR } from "./../constants";
import { Cactus } from "./cactus";
import { BASE_MOVE_SPEED, PTERODACTYL_SPAWN_CHANCE, CACTUS_SPAWN_CHANCE, PTERODACTYL_SPAWN_START_DELAY } from "../constants";
import { StatePlay } from "../states/state-play";
import { Pterodactyl } from "./pterodactyl";
import { Log } from "../utils/log";

export class ObstacleSpawner {

	private spawnTimer = 0;

	constructor(private state: StatePlay) { }

	public update(deltaTime: number) {
		this.spawnTimer += deltaTime;
		const isMobile = window.isMobile();
		const spawnInterval = (this.state.width / BASE_MOVE_SPEED) / this.state.speed * (isMobile ? MOBILE_INTERVAL_FACTOR : OBSTACLE_INTERVAL_FACTOR);

		if (this.spawnTimer >= spawnInterval) {
			if (!isMobile && this.state.main.globalTimer >= PTERODACTYL_SPAWN_START_DELAY && Math.random() <= PTERODACTYL_SPAWN_CHANCE * this.state.speed) {
				Log.debug("ObstacleSpawner", "Spawning Pterodactyl...");
				this.state.obstacles.push(new Pterodactyl(this.state));
			} else if (Math.random() <= CACTUS_SPAWN_CHANCE * this.state.speed) {
				Log.debug("ObstacleSpawner", "Spawning Cactus...");
				this.state.obstacles.push(new Cactus(this.state));
			} else return;

			if (Math.random() > OBSTACLE_DOUBLE_SPAWN_CHANCE / this.state.speed) {
				this.spawnTimer = 0;
			} else {
				this.spawnTimer -= spawnInterval / 2.0;
				Log.debug("ObstacleSpawner", "Double spawn!");
			}
		}
	}

}