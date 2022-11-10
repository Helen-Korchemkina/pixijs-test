import * as PIXI from "pixi.js";
import Tween from "./Tween";
import PixiSlot from "./PixiSlot";
import Reel from "./Reel";

export default class Container extends PIXI.Container {
    private reelContainer!: PIXI.Container;
    private reelsRunning: boolean = false;

    constructor() {
        super();

        const margin = (PixiSlot.gameHeight - Reel.SYMBOL_SIZE * 3) / 2;

        const frame = new PIXI.Graphics();
        frame.beginFill(0x56aab3);
        frame.lineStyle({ color: 0x111111, width: 10, alignment: 0 });
        frame.drawRect(0, 0, PixiSlot.gameWidth, PixiSlot.gameHeight);
        frame.position.set(0, 0);

        this.reelContainer = new PIXI.Container();
        this.reelContainer.y = margin;
        this.reelContainer.x = Math.round(PixiSlot.gameWidth - Reel.REEL_WIDTH * 4 + 170);

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        for (let i = 0; i < 3; i++) {
            this.reelContainer.addChild(new Reel(i));
        }

        const top = new PIXI.Graphics();
        top.beginFill(0, 1);
        top.drawRect(0, 0, PixiSlot.gameWidth, margin);
        const bottom = new PIXI.Graphics();
        bottom.beginFill(0, 1);
        bottom.drawRect(0, Reel.SYMBOL_SIZE * 3 + margin, PixiSlot.gameWidth, margin);

        const playButton = PIXI.Sprite.from(`../assets/button.png`);
        playButton.anchor.set(0.5);
        playButton.scale.x = playButton.scale.y = 0.21;
        playButton.x = PixiSlot.gameWidth / 2;
        playButton.y = PixiSlot.gameHeight - 50;
        bottom.addChild(playButton);

        this.addChild(frame);
        this.addChild(this.reelContainer);
        this.addChild(top);
        this.addChild(bottom);

        bottom.interactive = true;
        bottom.buttonMode = true;
        bottom.addListener("pointerdown", () => this.startPlay());
    }

    public startPlay(): void {
        if (this.reelsRunning) {
            return;
        }
        this.reelsRunning = true;

        const reels = this.reelContainer.children;
        for (let i = 0; i < reels.length; i++) {
            const reel = reels[i] as Reel;
            const extra = Math.floor(Math.random() * 3);
            const target = reel.index + 10 + i * 5 + extra;
            const time = 2500 + i * 600 + extra * 600;
            const tween = new Tween(
        reel,
        'index',
        target,
        time,
        Tween.backinout(0.5),
        null,
        i === reels.length - 1 ? () => { this.reelsRunning = false; } : null,
            );
            Tween.tweening.push(tween);
        }
    }

    public update(): void {
        const reels = this.reelContainer.children;
        for (let i = 0; i < reels.length; i++) {
            const reel = reels[i] as Reel;
            if (!reel.update) {
                continue;
            }
            reel.update();
        }

        Tween.update();
    }
}
