import * as PIXI from "pixi.js";
import Container from "./Container";

export default class PixiSlot {
  public static readonly gameWidth: number = 700;
  public static readonly gameHeight: number = 640;
  public static readonly slotTextures: string[] = [
    '/assets/cat.png',
    '/assets/emoticon.png',
    '/assets/frog.png',
    '/assets/piggy.png',
    '/assets/smile.png'
  ];

  private app!: PIXI.Application;
  private container!: Container;
  private onReady: () => void = () => { };

  constructor() {
    this.app = new PIXI.Application({
      width: PixiSlot.gameWidth,
      height: PixiSlot.gameHeight,
    });
    document.body.appendChild(this.app.view);

    for (let i = 0; i < PixiSlot.slotTextures.length; i++) {
      const texture = PixiSlot.slotTextures[i];
      this.app.loader.add(texture);
    }

    this.app.loader.load(() => {
      this.container = new Container();
      this.onReady();
    });
  }

  public start(): void {
    if (!this.container) {
      this.onReady = () => this.start();
      return;
    }
    this.app.stage.addChild(this.container);
    this.app.ticker.add(() => {
      this.container.update();
    });
  }
}