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

			const audio = new Audio();
			audio.src = `${window.location.href}/assets/audio/${id}.mp3`;
			audio.crossOrigin = "anonymous";
			audio.volume = AUDIO_VOLUME;
			audio.id = `audio-${id}`;

			audio.onerror = (e) => {
				Log.error("AudioUtils", `Failed to load audio: ${id}`, e.toString());
				reject(e);
			};
			audio.oncanplay = () => {
				this.cache.set(id, audio);
				resolve(audio);
			};
		});
	}

	public static async setup() {
		await Promise.all([
			this.load(SoundFX.Jump),
			this.load(SoundFX.GameOver),
			this.load(SoundFX.Score),
			this.load(SoundFX.Phase),
		]);
	}

	public static play(id: SoundFX) {
		const audio = this.cache.get(id);
		if (audio === undefined) throw new Error(`Audio not found: ${id}`);

		audio.currentTime = 0;
		audio.play();
	}

}