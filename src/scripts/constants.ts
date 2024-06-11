export const MARGIN = 15;

// Mainly for debugging purposes
export const SIMULATION_FREQUENCY = 60;
export const SIMULATION_SUBSTEPS = 4;
export const USE_ANIMATION_FRAME = true;
export const GOD_MODE = false && DEBUG;

// Font
export const FONT_SIZE = 48;
export const FONT_FAMILY = "'Pixelify Sans', sans-serif";

// Audio
export const AUDIO_VOLUME = 0.2;

// Dino
export const DINO_SPRITE_SWITCH_INTERVAL = 0.25;
export const DINO_FRICTION = 1000;
export const DINO_GRAVITY = 2000;
export const DINO_FALL_FORCE = DINO_GRAVITY * 1.5;
export const DINO_JUMP_FORCE = -DINO_GRAVITY * 151;
export const DINO_INVULNERABILITY_DURATION = 1.5;

export const BASE_MOVE_SPEED = 400;

// Clouds
export const CLOUD_COUNT = 6;
export const CLOUD_SPAWN_CHANCE = 0.005;
export const CLOUD_SPAWN_INTERVAL = 0.250;
export const CLOUD_MIN_MOVE_SPEED = -25;
export const CLOUD_MAX_MOVE_SPEED = -50;

// Obstacles
export const OBSTACLE_DOUBLE_SPAWN_CHANCE = 0.25;
export const CACTUS_SPAWN_CHANCE = 0.05;
export const CACTUS_BIG_SPAWN_CHANCE = 0.250;
export const PTERODACTYL_SPAWN_CHANCE = 0.005;
export const PTERODACTYL_SPAWN_START_DELAY = 5.0;

// Mobile
export const MOBILE_SPEED_FACTOR = 1.2;
export const MOBILE_INTERVAL_FACTOR = 1.5;

// Input
export const LONG_PRESS = 110;

// Misc
export const SCORE_INTERVAL = 0.1;