import Phaser from 'phaser';
import lipsPNG from './assets/lips.png';
import lipsJSON from './assets/lips.json';
import config from './config.json';
import headParts from './headParts.json';
import lipAnim from './lipAnim.json';
import facePNG from './assets/KeyFace 12.png';
import eyesPNG from './assets/KeyFace pupils.png';

// const inputX = document.querySelector('#x');
// const inputY = document.querySelector('#y');
// const inputScale = document.querySelector('#scale');
//const inputEyes = document.querySelector('#eyes');
let head;

class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }
  preload() {
    this.load.atlas('lips', lipsPNG, lipsJSON);
    this.load.image('face', facePNG);
    this.load.image('eyes', eyesPNG);
  }
  create() {
    const face = this.add.image(0, 0, 'face');
    const eyes = this.add.image(0, headParts.eyes.y, 'eyes');
    const lips = this.add.sprite(0, headParts.lips.y, 'lips', lipAnim.default[0]);
    head = this.add.container(config.width / 2 + config.head.x, config.height / 2 + config.head.y, [
      face,
      eyes,
      lips,
    ]);
    head.scale = config.head.scale;

    Object.keys(lipAnim).forEach((key, i) => {
      this.anims.create({
        key: key,
        frames: this.anims.generateFrameNames('lips', { frames: lipAnim[key] }).map((frame, i) => {
          frame.duration = 1000 / config.fps;
          return frame;
        }),
        yoyo: true,
      });
      this.add
        .text(config.text.marginLeft, config.text.marginTop + config.text.lineHeight * i, key, {
          color: config.color.foreground,
          fontSize: config.text.fontSize,
          align: 'left',
        })
        .setInteractive();
    });

    this.input.on('gameobjectover', (p, target) => {
      target.scale = 1.1;
      if (!target.text && !lipAnim[target.text]) return;
      lips.play(target.text);
    });
    this.input.on('gameobjectout', (p, target) => {
      target.scale = 1;
    });
    // this.input.on('gameobjectup', (p, target) => {
    //   if (!target.text && !lipAnim[target.text]) return;
    //   lips.play(target.text);
    //   //console.log(target);
    // });
    //this.input.on('pointerup', () => lips.play('lipsA'));
  }
  // update() {
  //   head.x = config.width / 2 + Number(inputX.value);
  //   head.y = config.height / 2 + Number(inputY.value);
  //   head.scale = Number(inputScale.value) / 100;
  //   //eyes.y = Number(inputEyes.value);
  // }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: config.width,
  height: config.height,
  scene: MyGame,
  backgroundColor: Phaser.Display.Color.HexStringToColor(config.color.background),
});
