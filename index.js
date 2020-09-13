'use strict';

const Pet = require("./Pet");


// TODO

/*
// Koishi插件名
module.exports.name = 'pet';
// 插件处理和输出

module.exports.apply = (ctx) => {
    let petCollection = {};

    ctx.middleware((meta, next) => {
        try {
            const command = meta.message.trim();
            const userId = meta.userId;
            if (command.length < 3) return next();
            if (command.substring(0, 1) !== "!" && command.substring(0, 1) !== "！") return next();
            let act = command.substring(1);
            if (act === "领养") {
                if (petCollection[userId]) return meta.$send("您已经有一个小可爱了");
                let _pet = new Pet();
                _pet.active();
                petCollection[userId] = _pet;
                return meta.$send("你领养了一只猫");
            }
            if (act === "抛弃") {
                if (!petCollection[userId]) return meta.$send("您已经有一个小可爱了");
                petCollection[userId].sleep();
                delete petCollection[userId];
                return meta.$send("您抛弃了您的小可爱QAQ");
            }
            if (act === "状态") {
                if (!petCollection[userId]) return meta.$send("您已经有一个小可爱了");
                return meta.$send(petCollection[userId].showStats());
            }
            if (act.startsWith("取名")) {
                if (!petCollection[userId]) return meta.$send("您已经有一个小可爱了");
                let name = act.substring(2).trim();
                petCollection[userId].setName(name);
                return meta.$send("给小可爱取名叫" + name);
            }
            if (act === "喂食") {
                if (!petCollection[userId]) return meta.$send("您已经有一个小可爱了");
                return meta.$send(petCollection[userId].eat());
            }
            if (act === "喂水") {
                if (!petCollection[userId]) return meta.$send("您已经有一个小可爱了");
                return meta.$send(petCollection[userId].drink());
            }
            if (act === "玩耍") {
                if (!petCollection[userId]) return meta.$send("您已经有一个小可爱了");
                return meta.$send(petCollection[userId].play());
            }
            if (act === "治疗") {
                if (!petCollection[userId]) return meta.$send("您已经有一个小可爱了");
                return meta.$send(petCollection[userId].cure());
            }
            if (act === "起床") {
                if (!petCollection[userId]) return meta.$send("您已经有一个小可爱了");
                return meta.$send(petCollection[userId].active());
            }
            if (act === "睡觉") {
                if (!petCollection[userId]) return meta.$send("您已经有一个小可爱了");
                return meta.$send(petCollection[userId].sleep());
            }
            return next();
        }
        catch (ex) {
            console.log(ex);
            return next();
        }
    });
}
    */