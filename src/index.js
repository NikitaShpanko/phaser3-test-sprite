import Phaser from 'phaser';

const WIDTH = 600;
const HEIGHT = 600;
const NOTES = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const COLOR_INACTIVE = 0xffffff;
const COLOR_ACTIVE = 0xff0000;
const STRING_LENGTH = 0.8;
const STRING_THICKNESS = 0.04;
const FRET_COUNT = 24;

class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }
  preload() {
    NOTES.map(note => {
      this.load.audio(
        note,
        `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/${note}.mp3`,
      );
    });
  }
  create() {
    document
      .querySelector('body')
      .insertAdjacentHTML(
        'beforeend',
        '<label><input type="checkbox" name="checked"/>Randomize frets</label>',
      );
    const chkRandom = document.querySelector('input');
    const shapes = NOTES.map((note, i) => {
      const rect = this.add.rectangle(
        WIDTH / 2,
        ((NOTES.length - i) * HEIGHT) / (NOTES.length + 1),
        WIDTH * STRING_LENGTH,
        HEIGHT * STRING_THICKNESS,
        COLOR_INACTIVE,
      );
      rect.setInteractive();
      return rect;
    });
    const sounds = NOTES.map((note, i) => {
      const sound = this.sound.add(note);
      sound.on('complete', () => {
        shapes[i].fillColor = COLOR_INACTIVE;
      });
      return sound;
    });

    this.input.on('gameobjectover', (p, target) => {
      if (!p.buttons) return;
      const i = shapes.indexOf(target);
      if (i < 0) return;
      sounds[i].play({ detune: chkRandom.checked ? Phaser.Math.Between(0, FRET_COUNT) * 100 : 0 });
      target.fillColor = COLOR_ACTIVE;
    });
    this.input.on('gameobjectup', (p, target) => {
      const i = shapes.indexOf(target);
      if (i < 0) return;
      sounds[i].stop();
      target.fillColor = COLOR_INACTIVE;
    });
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: WIDTH,
  height: HEIGHT,
  scene: MyGame,
};
const game = new Phaser.Game(config);
