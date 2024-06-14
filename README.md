# Dino

Typescript implementation of the [Chromium dinosaur game](https://chromedino.com/), made using the HTML5 Canvas API.

<center>
    <p float="left" align="center">
		<img src=".github/screenshots/screenshot01.png" style="width: 48%"/>
        <img src=".github/screenshots/screenshot02.png" style="width: 48%"/>
    </p>
</center>

<p align="center">
	<a href="https://leandrosq.github.io/js-dino/">Live demo here</a>
</p>

## About

It is a simple implementation of the Chromium dinosaur game, with some minor changes.

## Features

- [x] Dark mode
- [x] Light mode
- [x] Score system
  - [x] High score system
- [x] Game over screen
- [ ] Pause screen
- [x] AI mode
- [x] Sound effects
- [x] Mobile support
  - [X] No pterodactyls due to no crouching
  - [X] Touch controls
  - [X] Responsive game speed
  - [X] Vibration API
- [X] Keyboard and mouse controls
- [X] GamePad support
  - [X] Rumble effect
- [x] Menu with animations
- [x] Physics simulation with substeps
  - [x] Using Velocity Verlet integration
- [x] Pixel perfect collision detection
<p float="left" style="margin-left: 30pt">
	<img src=".github/screenshots/pixelperfect.gif" style="width: 200px; border-radius: 5pt; box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.35)"/>
</p>

## How to play

Jump over the obstacles and try to get the highest score possible!

### Keyboard

| Key | Icon| Description |
| -- | -- | -- |
| <kbd>Arrow up</kbd> | <img src=".github/images/Arrow_Up_Key_Dark.png" align="center" height="32"> | Jump |
| <kbd>Arrow down</kbd> | <img src=".github/images/Arrow_Up_Key_Dark.png" align="center" height="32"> | Duck/Crouch |
| <kbd>A</kbd> | <img src=".github/images/A_Key_Dark.png" align="center" height="32"> | Toggle AI |

### Mouse

| Key | Icon| Description |
| -- | -- | -- |
| <kbd>Left click</kbd> | <img src=".github/images/Mouse_Left_Key_Dark.png" align="center" height="32"> | Jump |
| <kbd>Right click</kbd> | <img src=".github/images/Mouse_Right_Key_Dark.png" align="center" height="32"> | Duck/Crouch |
| <kbd>Middle click</kbd> | <img src=".github/images/Mouse_Middle_Key_Dark.png" align="center" height="32"> | Toggle AI |

### Touch

| Key | Icon| Description |
| -- | -- | -- |
| <kbd>Tap</kbd> | <img src=".github/images/Gesture_Tap.png" align="center" height="32"> | Jump |

### Game pad

<small>The game supports any GamePad, being it wireless or wired, Xbox, PS or generic!</small>

| Button | Icon | Description |
| -- | -- | -- |
| <kbd>A</kbd> or <kbd>D-Pad Up</kbd> | <img src=".github/images/GamePad_A.png" align="center" height="24"> or <img src=".github/images/GamePad_Up.png" align="center" height="24"> | Jump |
| <kbd>B</kbd> or <kbd>D-Pad Up</kbd> | <img src=".github/images/GamePad_B.png" align="center" height="24"> or <img src=".github/images/GamePad_Down.png" align="center" height="24"> | Duck/Crouch |
| <kbd>Start</kbd> | <img src=".github/images/GamePad_Start.png" align="center" height="32"> | Toggle AI |

## Used in this project

| Name | Description |
| -- | -- |
| Eslint | For linting and semantic analysis |
| Prettier | For code formatting |
| Browser sync | For live reloading |
| Esbuild | For bundling |
| gulp | For task automation |
| SASS | For CSS preprocessing |
| oklch | For color manipulation |
| Github actions | For CI, building and deploying to github pages |
| Google fonts | For the [Pixelify Sans font](https://fonts.google.com/specimen/Pixelify+Sans) |
| Google Icons | For the [Sport tennis icon](https://fonts.google.com/icons?selected=Material%20Symbols%20Outlined%3Asports_tennis%3AFILL%400%3Bwght%40400%3BGRAD%400%3Bopsz%4024) used as favicon |
| [Real favicon generator](https://realfavicongenerator.net/) | For generating the favicon |
| [Chrome dino game](https://chromedino.com/) | For sounds, images and inspiration |
| [Those Awesome Guys](https://thoseawesomeguys.com/) | For the input images for keyboard, tap, mouse and gamepad |