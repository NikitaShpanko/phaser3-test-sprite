import Phaser from 'phaser';

import lipsPNG from './assets/lips.png';
import lipsJSON from './assets/lips.json';
import facePNG from './assets/KeyFace 12.png';
import eyesPNG from './assets/KeyFace pupils.png';

import config from './param/config.json';
import headParts from './param/headParts.json';
import lipAnim from './param/lipAnim.json';
import behavior from './param/behavior.json';

const MAX_DIST = Phaser.Math.Distance.Between(config.width, config.height, 0, 0) / 2;

// const input = document.querySelector('input');
// input.value = 10;

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
    });

    this.input.on('gameobjectover', (p, target) => {
      target.scale = 1.1;
      if (!target.text && !lipAnim[target.text]) return;
      lips.play(target.text);
    });
    this.input.on('gameobjectout', (p, target) => {
      target.scale = 1;
    });

    if (config.debug) {
      const eyeLine = this.add.line(0, headParts.eyes.lineY, 0, 0, face.width, 0, 0xff0000);
      const lineCenter = this.add.line(0, 0, 0, 0, 0, face.height, 0xff0000);
      const eyeLeft = this.add.circle(
        -headParts.eyes.aperture / 2,
        headParts.eyes.lineY,
        headParts.eyes.maxRadius,
      );
      eyeLeft.isFilled = false;
      eyeLeft.isStroked = true;
      eyeLeft.setStrokeStyle(2, 0xff0000);

      const eyeLeftGhost = this.add.circle(
        -headParts.eyes.aperture / 2,
        headParts.eyes.lineY,
        headParts.eyes.maxRadius + headParts.eyes.pupilHeight / 2,
      );
      eyeLeftGhost.isFilled = false;
      eyeLeftGhost.isStroked = true;
      eyeLeftGhost.setStrokeStyle(2, 0xff0000, 0.7);

      const lineLeft = this.add.line(
        -headParts.eyes.aperture / 2,
        headParts.eyes.lineY,
        0,
        0,
        0,
        headParts.eyes.pupilHeight,
        0xff0000,
      );
      const lineRight = this.add.line(
        headParts.eyes.aperture / 2,
        headParts.eyes.lineY,
        0,
        0,
        0,
        headParts.eyes.pupilHeight,
        0xff0000,
      );
      head.add([eyeLine, lineCenter, lineLeft, eyeLeft, eyeLeftGhost, lineRight]);
    }

    const lineOfSight = new Phaser.Geom.Line();

    const graphics = this.add.graphics();
    this.input.on('pointermove', pointer => {
      let angleHead = Phaser.Math.Angle.Between(pointer.x, pointer.y, head.x, head.y);
      if (angleHead > Math.PI / 4) angleHead = Math.PI / 2 - angleHead;
      if (angleHead < -Math.PI / 4) angleHead = -Math.PI / 2 - angleHead;
      if (angleHead > Math.PI / 4) angleHead = Math.PI / 2 - angleHead;
      head.rotation = angleHead * behavior.turnCoeff;

      const distHead = Phaser.Math.Distance.Between(pointer.x, pointer.y, head.x, head.y);
      head.scale = config.head.scale - (1 - distHead / MAX_DIST) * behavior.scaleCoeff;

      const eyeD = head.scale * headParts.eyes.lineY;
      const eyeX = head.x - eyeD * Math.sin(head.rotation);
      const eyeY = head.y + eyeD * Math.cos(head.rotation);

      const angleEye = Phaser.Math.Angle.Between(pointer.x, pointer.y, eyeX, eyeY) - head.rotation;
      const distEye = Phaser.Math.Distance.Between(pointer.x, pointer.y, eyeX, eyeY);
      lineOfSight.x1 = pointer.x;
      lineOfSight.y1 = pointer.y;
      lineOfSight.x2 = eyeX;
      lineOfSight.y2 = eyeY;

      let distInEye = headParts.eyes.distCoeff * distEye;
      if (distInEye > headParts.eyes.maxRadius) {
        distInEye = headParts.eyes.maxRadius;
      }

      eyes.x = -distInEye * Math.cos(angleEye);
      eyes.y = -distInEye * Math.sin(angleEye);

      if (config.debug) {
        graphics.clear();
        graphics.strokeLineShape(lineOfSight);
      }
    });
    this.input.on('gameout', () => {
      if (config.debug) graphics.clear();
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
