import * as PIXI from "pixi.js";
import PixiSlot from "./PixiSlot";

export default class Reel extends PIXI.Container {
    public static readonly REEL_WIDTH: number = 200;
    public static readonly SYMBOL_SIZE: number = 140;

    public static get randomTexture(): PIXI.Texture {
        if (Reel.slotTextures.length === 0) {
            for (let i = 0; i < PixiSlot.slotTextures.length; i++) {
                const resource = PixiSlot.slotTextures[i];
                Reel.slotTextures.push(PIXI.Texture.from(resource));
            }
        }
        return Reel.slotTextures[Math.floor(Math.random() * Reel.slotTextures.length)];
    }

    private static slotTextures: PIXI.Texture[] = [];

    public blur = new PIXI.filters.BlurFilter();

    public index: number = 0;
    public previousPosition: number = 0;

    constructor(index: number) {
        super();

        this.x = index * Reel.REEL_WIDTH;
        this.blur.blurX = 0;
        this.blur.blurY = 0;
        this.filters = [this.blur];

        for (let i = 0; i < 5; i++) {
            const symbol = new PIXI.Sprite();
            this.updateSymbol(symbol);
            this.addChild(symbol);
        }
    }

    public update(): void {
        this.blur.blurY = (this.index - this.previousPosition) * 8;
        this.previousPosition = this.index;

        for (let i = 0; i < this.children.length; i++) {
            const symbol = this.children[i] as PIXI.Sprite;
            if (!symbol.texture) {
                continue;
            }

            const prevY = symbol.y;
            symbol.y = ((this.index + i) % this.children.length) * Reel.SYMBOL_SIZE - Reel.SYMBOL_SIZE;

            if (prevY <= Reel.SYMBOL_SIZE) {
                continue;
            }
            if (symbol.y >= 0) {
                continue;
            }

            this.updateSymbol(symbol);
        }
    }

    private updateSymbol(symbol: PIXI.Sprite): void {
        symbol.texture = Reel.randomTexture;
        symbol.scale.x = symbol.scale.y = Math.min(
            Reel.SYMBOL_SIZE / (symbol.width / symbol.scale.x),
            Reel.SYMBOL_SIZE / (symbol.height / symbol.scale.y),
        );
        symbol.x = Math.round((Reel.SYMBOL_SIZE - symbol.width) / 2);
    }
}
