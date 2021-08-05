import Phaser from 'phaser';
import lipsPNG from './assets/lips.png';
import lipsJSON from './assets/lips.json';
import lipAnim from './lipAnim.json';
import facePNG from './assets/KeyFace 12.png';
import faceTestPNG from './assets/KeyFace test 12a.png';

const WIDTH = 600;
const HEIGHT = 600;

const inputX = document.querySelector('#x');
const inputY = document.querySelector('#y');
const inputScale = document.querySelector('#scale');
let head;

class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }
  preload() {
    this.load.atlas('lips', lipsPNG, lipsJSON);
    this.load.image('test', faceTestPNG);
    this.load.image('face', facePNG);
  }
  create() {
    const test = this.add.image(0, 0, 'test');
    test.alpha = 0.5;
    const face = this.add.image(0, 0, 'face');
    const lips = this.add.sprite(0, 330, 'lips', 'KeyFace Lips Y not stressed - DEFAULT.png');
    head = this.add.container(WIDTH / 2, HEIGHT / 2, [test, face, lips]);
    //head.scale = 0.5;
    // console.log(
    //   this.anims.generateFrameNames('lips', { frames: lipAnim.lipsA }).map(frame => {
    //     frame.duration = 40;
    //     return frame;
    //   }),
    // );
    this.anims.create({
      key: 'lipsA',
      frames: this.anims.generateFrameNames('lips', { frames: lipAnim.lipsA }).map((frame, i) => {
        frame.duration = i === lipAnim.lipsA.length - 1 ? 500 : 1000 / 30;
        return frame;
      }),
      yoyo: true,
      repeat: -1,
    });
    this.input.on('pointerup', () => lips.play('lipsA'));
    //lips.play('lipsA');
  }
  update() {
    head.x = WIDTH / 2 + Number(inputX.value);
    head.y = HEIGHT / 2 + Number(inputY.value);
    head.scale = Number(inputScale.value) / 100;
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  scene: MyGame,
  backgroundColor: 0xffffff,
};
const game = new Phaser.Game(config);
