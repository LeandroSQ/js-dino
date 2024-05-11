import { AUDIO_VOLUME } from "../constants";

export abstract class AudioSynth {

	private static context: AudioContext;
	private static master: GainNode;

	public static async setup() {
		this.context = new AudioContext();
		this.master = this.context.createGain();
		this.master.connect(this.context.destination);
		this.master.gain.setValueAtTime(AUDIO_VOLUME, this.context.currentTime);
	}

	private static async resume() {
		if (this.context.state === "suspended" || this.context.state === "interrupted") {
			await this.context.resume();
		} else if (this.context.state === "closed") {
			await this.setup();

			return true;
		}

		return false;
	}

	// eslint-disable-next-line max-statements
	public static async play(frequency: number, duration: number, pan = 0) {
		if (await this.resume()) return;

		const gain = this.context.createGain();
		gain.connect(this.master);

		const panning = this.context.createStereoPanner();
		panning.connect(gain);
		panning.pan.setValueAtTime(pan, this.context.currentTime);

		const oscillator = this.context.createOscillator();
		oscillator.connect(panning);
		oscillator.type = "square";
		oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

		// Envelope
		const attack = 0.01;
		const decay = 0.1;
		const sustain = 0.4;
		const release = 0.1;
		const now = this.context.currentTime;
		const length = duration / 1000;

		// Calculate the timings
		const attackTime = now + attack * length;
		const decayTime = attackTime + decay * length;
		const sustainTime = decayTime + sustain * length;
		const releaseTime = sustainTime + release * length;

		// Set the gain values, preventing clicks
		gain.gain.setValueAtTime(0.0, now);
		gain.gain.linearRampToValueAtTime(AUDIO_VOLUME, attackTime);
		gain.gain.linearRampToValueAtTime(0.8 * AUDIO_VOLUME, decayTime);
		gain.gain.linearRampToValueAtTime(0.8 * AUDIO_VOLUME, sustainTime);
		gain.gain.linearRampToValueAtTime(0.0, releaseTime);

		oscillator.addEventListener("ended", () => {
			oscillator.disconnect();
			panning.disconnect();
			gain.disconnect();
		});

		oscillator.start(now);
		oscillator.stop(releaseTime);
	}

}