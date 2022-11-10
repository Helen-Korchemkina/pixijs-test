export default class Tween {
    public static tweening: Tween[] = [];

    public propertyBeginValue: any;
    public start: number = Date.now();

    constructor(
        public object: any,
        public property: string,
        public target: number,
        public time: number,
        public easing: (t: number) => number,
        public change: (tween: Tween) => void | null,
        public complete: (tween: Tween) => void | null,
    ) {
        this.propertyBeginValue = object[property];
    }

    public static update(): void {
        const now = Date.now();
        const remove = [];
        for (let i = 0; i < Tween.tweening.length; i++) {
            const tween = Tween.tweening[i];
            const phase = Math.min(1, (now - tween.start) / tween.time);

            tween.object[tween.property] = Tween.lerp(tween.propertyBeginValue, tween.target, tween.easing(phase));
            if (tween.change) {
                tween.change(tween);
            }
            if (phase === 1) {
                tween.object[tween.property] = tween.target;
                if (tween.complete) {
                    tween.complete(tween);
                }
                remove.push(tween);
            }
        }
        for (let i = 0; i < remove.length; i++) {
            Tween.tweening.splice(Tween.tweening.indexOf(remove[i]), 1);
        }
    }

    public static lerp(startValue: number, endValue: number, change: number) {
        return startValue * (1 - change) + endValue * change;
    }

    public static backinout(amount: number) {
        amount *= 1.525;
        return (tick: number) => {
            if ((tick *= 2) < 1) return 0.5 * (tick * tick * ((amount + 1) * tick - amount));
            return 0.5 * ((tick -= 2) * tick * ((amount + 1) * tick + amount) + 2);
        };
    }
}
