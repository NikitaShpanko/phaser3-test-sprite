import Phaser from 'phaser';

class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }
  preload() {
    this.load.audio(
      'e2',
      'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/E2.mp3',
    );
  }
  create() {
    const sound = this.sound.add('e2');
    this.input.on('pointerdown', () => {
      sound.play();
    });
    this.input.on('pointerup', () => {
      sound.stop();
    });
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 400,
  height: 300,
  scene: MyGame,
};
const game = new Phaser.Game(config);
