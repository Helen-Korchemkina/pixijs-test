import * as PIXI from "pixi.js";
import "./style.css";

const gameWidth = 700;
const gameHeight = 640;

const app = new PIXI.Application({
    width: gameWidth,
    height: gameHeight,
});
document.body.appendChild(app.view);

const frame = new PIXI.Graphics();
frame.beginFill(0x56aab3);
frame.lineStyle({ color: 0x111111, width: 10, alignment: 0 });
frame.drawRect(0, 0, gameWidth, gameHeight);
frame.position.set(0, 0);
app.stage.addChild(frame);

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

app.loader
    .add(`../assets/cat.png`)
    .add(`../assets/emoticon.png`)
    .add(`../assets/frog.png`)
    .add(`../assets/piggy.png`)
    .add(`../assets/smile.png`)
    .load(onAssetsLoaded);

const REEL_WIDTH = 200;
const SYMBOL_SIZE = 140;

function onAssetsLoaded() {
    const slotTextures = [
        PIXI.Texture.from(`../assets/cat.png`),
        PIXI.Texture.from(`../assets/emoticon.png`),
        PIXI.Texture.from(`../assets/frog.png`),
        PIXI.Texture.from(`../assets/piggy.png`),
        PIXI.Texture.from(`../assets/smile.png`),
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reels: any[] = [];
    const reelContainer = new PIXI.Container();
    for (let i = 0; i < 3; i++) {
        const rc = new PIXI.Container();
        rc.x = i * REEL_WIDTH;
        reelContainer.addChild(rc);

        const reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new PIXI.filters.BlurFilter(),
        };
        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        for (let j = 0; j < 5; j++) {
            const symbol = new PIXI.Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);

            symbol.y = j * SYMBOL_SIZE;
            symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height);
            symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
            reel.symbols.push(symbol);
            rc.addChild(symbol);
        }
        reels.push(reel);
    }
    app.stage.addChild(reelContainer);

    const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
    reelContainer.y = margin;
    reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 4 + 170);
    const top = new PIXI.Graphics();
    top.beginFill(0, 1);
    top.drawRect(0, 0, app.screen.width, margin);
    const bottom = new PIXI.Graphics();
    bottom.beginFill(0, 1);
    bottom.drawRect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin);

    const playButton = PIXI.Sprite.from(`../assets/button.png`);
    playButton.anchor.set(0.5);
    playButton.scale.x = playButton.scale.y = 0.21;
    playButton.x = app.screen.width / 2;
    playButton.y = app.screen.height - 50;
    bottom.addChild(playButton);

    app.stage.addChild(top);
    app.stage.addChild(bottom);

    bottom.interactive = true;
    bottom.buttonMode = true;
    bottom.addListener("pointerdown", () => {
        startPlay();
    });

    let running = false;

    function startPlay() {
        if (running) return;
        running = true;

        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            const extra = Math.floor(Math.random() * 3);
            const target = r.position + 10 + i * 5 + extra;
            const time = 2500 + i * 600 + extra * 600;
            tweenTo(r, "position", target, time, backinout(0.5), null, i === reels.length - 1 ? reelsComplete : null);
        }
    }

    function reelsComplete() {
        running = false;
    }

    app.ticker.add(() => {
        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];

            r.blur.blurY = (r.position - r.previousPosition) * 8;
            r.previousPosition = r.position;

            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevy = s.y;
                s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                if (s.y < 0 && prevy > SYMBOL_SIZE) {
                    s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                    s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                }
            }
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tweening: any[] = [];
function tweenTo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: any,
    property: string,
    target: number,
    time: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    easing: (t: any) => number,
    onchange: null,
    oncomplete: (() => void) | null,
) {
    const tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now(),
    };

    tweening.push(tween);
    return tween;
}

app.ticker.add(() => {
    const now = Date.now();
    const remove = [];
    for (let i = 0; i < tweening.length; i++) {
        const t = tweening[i];
        const phase = Math.min(1, (now - t.start) / t.time);

        t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
        if (t.change) t.change(t);
        if (phase === 1) {
            t.object[t.property] = t.target;
            if (t.complete) t.complete(t);
            remove.push(t);
        }
    }
    for (let i = 0; i < remove.length; i++) {
        tweening.splice(tweening.indexOf(remove[i]), 1);
    }
});

function lerp(a1: number, a2: number, t: number) {
    return a1 * (1 - t) + a2 * t;
}

function backinout(amount: number) {
    amount *= 1.525;
    return (t: number) => {
        if ((t *= 2) < 1) return 0.5 * (t * t * ((amount + 1) * t - amount));
        return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
    };
}
