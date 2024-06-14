import { Log } from "./log";
import { SoundFX } from "../types/soundfx";
import { AUDIO_VOLUME } from "../constants";

export abstract class AudioUtils {

	private static readonly cache = new Map<string, HTMLAudioElement>();

	private static load(id: SoundFX): Promise<HTMLAudioElement> {
		return new Promise((resolve, reject) => {
			if (this.cache.has(id)) {
				const value = this.cache.get(id);
				if (!value) throw new Error("Unexpected undefined value in cache");

				return resolve(value);
			}

			const audio = new Audio(`${window.location.href}assets/audio/${id}.mp3`);
			audio.crossOrigin = "anonymous";
			audio.volume = AUDIO_VOLUME;
			audio.id = `audio-${id}`;
			audio.preload = "none";

			audio.onerror = (e) => {
				Log.error("AudioUtils", `Failed to load audio: ${id}`, JSON.stringify(e, ["message", "arguments", "type", "name"]));
				reject(e);
			};
			audio.oncanplay = () => {
				Log.info("AudioUtils", `Loaded audio: ${id}`);
				this.cache.set(id, audio);
				resolve(audio);
			};
		});
	}

	public static async setup() {
		// Do not throw an error in case of failure
		// Since, for some reason Safari iOS does not allow audio to be played without user interaction
		try {
			Promise.all([
				this.load(SoundFX.Jump),
				this.load(SoundFX.GameOver),
				this.load(SoundFX.Score),
				this.load(SoundFX.Phase)
			]);
		} catch (e) {
			Log.error("AudioUtils", "Failed to load audio", e);
		}
	}

	public static play(id: SoundFX) {
		const audio = this.cache.get(id);
		if (audio === undefined) {
			Log.warn("AudioUtils", `Audio not found: ${id}`);

			return;
		}

		audio.currentTime = 0;
		audio.play();
	}

}