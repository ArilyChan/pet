'use strict';

static class Performance {
    static give_food_fail_relation(name, stage) {
        if (stage === 0) {
            const perf = [
                name + "不想吃你给的东西",
            ];
            return perf[Math.floor(Math.random() * perf.length)];
        }
        if (stage === 1) {
            const perf = [
                name + "看了一眼就走了",
                name + "不仅没吃，还挠了你一下",
            ];
            return perf[Math.floor(Math.random() * perf.length)];
        }
        if (stage === 2) {
            const perf = [
                name + "：才不要吃你给的东西喵",
            ];
            return perf[Math.floor(Math.random() * perf.length)];
        }
    }

    static give_food_fail_notHungry(name, stage) {
        if (stage === 0) {
            const perf = [
                name + "把它的脑袋歪向了另一边",
            ];
            return perf[Math.floor(Math.random() * perf.length)];
        }
        if (stage === 1) {
            const perf = [
                name + "连看都没看一眼",
            ];
            return perf[Math.floor(Math.random() * perf.length)];
        }
        if (stage === 2) {
            const perf = [
                name + "：人家还不饿",
                name + "：还没到饭点的说",
            ];
            return perf[Math.floor(Math.random() * perf.length)];
        }
    }
}


module.exports = Performance;