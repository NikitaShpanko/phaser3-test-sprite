import Phaser from 'phaser';

import lipsPNG from './assets/lips.png';
import lipsJSON from './assets/lips.json';
import facePNG from './assets/KeyFace 12.png';
import eyesPNG from './assets/KeyFace pupils.png';
import vowelsMP3 from './assets/vowels.mp3';
import vowelsOGG from './assets/vowels.ogg';

import config from './param/config.json';
import headParts from './param/headParts.json';
import lipAnim from './param/lipAnim.json';
import behavior from './param/behavior.json';
import vowelMarkers from './param/vowels.json';

const MAX_DIST = Phaser.Math.Distance.Between(config.width, config.height, 0, 0) / 2;

class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }
  preload() {
    this.load.audio('vowels', [vowelsMP3, vowelsOGG]);
    this.load.atlas('lips', lipsPNG, lipsJSON);
    this.load.image('face', facePNG);
    this.load.image('eyes', eyesPNG);
  }
  create() {
    const vowels = this.sound.add('vowels');
    const face = this.add.image(0, 0, 'face');
    const eyes = this.add.image(0, headParts.eyes.defaultY, 'eyes');
    const eyeContainer = this.add.container(0, headParts.eyes.lineY, eyes);
    const lips = this.add.sprite(0, headParts.lips.y, 'lips', lipAnim.default[0]);
    const head = this.add.container(
      config.width / 2 + config.head.x,
      config.height / 2 + config.head.y,
      [face, eyeContainer, lips],
    );
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
      vowels.addMarker({
        name: key,
        start: vowelMarkers[key].start,
        duration: vowelMarkers[key].end - vowelMarkers[key].start,
        config: { delay: behavior.soundDelay },
      });
    });

    this.input.on('gameobjectover', (p, target) => {
      target.scale = 1.1;
      if (!target.text && !lipAnim[target.text]) return;
      //vowels.play(target.text);
      this.sound.play('vowels', vowels.markers[target.text]);
      lips.play(target.text);
    });

    this.input.on('gameobjectout', (p, target) => {
      target.scale = 1;
    });

    this.input.on('pointermove', pointer => {
      let angleToHead = Phaser.Math.Angle.Between(pointer.x, pointer.y, head.x, head.y);
      if (angleToHead > Math.PI / 4) angleToHead = Math.PI / 2 - angleToHead;
      if (angleToHead < -Math.PI / 4) angleToHead = -Math.PI / 2 - angleToHead;
      if (angleToHead > Math.PI / 4) angleToHead = Math.PI / 2 - angleToHead;
      head.rotation = angleToHead * behavior.turnCoeff;

      const distToHead = Phaser.Math.Distance.Between(pointer.x, pointer.y, head.x, head.y);
      head.scale = config.head.scale - (1 - distToHead / MAX_DIST) * behavior.scaleCoeff;

      const eyeD = head.scale * headParts.eyes.lineY;
      const eyeX = head.x - eyeD * Math.sin(head.rotation);
      const eyeY = head.y + eyeD * Math.cos(head.rotation);

      const angleToEye =
        Phaser.Math.Angle.Between(pointer.x, pointer.y, eyeX, eyeY) - head.rotation;
      const distToEye = Phaser.Math.Distance.Between(pointer.x, pointer.y, eyeX, eyeY);

      let distInEye = behavior.eyeDistCoeff * distToEye;
      if (distInEye > headParts.eyes.maxRadius) {
        distInEye = headParts.eyes.maxRadius;
      }

      eyes.x = -distInEye * Math.cos(angleToEye);
      eyes.y = -distInEye * Math.sin(angleToEye);
    });

    this.input.on('gameout', () => {
      eyes.x = 0;
      eyes.y = headParts.eyes.defaultY;
    });
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: config.width,
  height: config.height,
  scene: MyGame,
  backgroundColor: Phaser.Display.Color.HexStringToColor(config.color.background),
});
