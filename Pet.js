'use strict';

const Performance = require("./res/Performance");

const PetStatus = {
    doNothing: 0,
    sleeping: 1,
    working: 2,
    studying: 3,
}

class PetStat {
    /**
     * 属性
     * @param {String} name 属性名称 
     * @param {Number} max 最大值
     * @param {Number} reduce 每分钟减少值
     */
    constructor(name, max, reduce) {
        this.name = name;
        this.max = max;
        this.reduce = reduce;
        this.reduceFactor = 1.0;

        this.value = this.max;
    }

    read(object) {
        this.name = object.name;
        this.max = object.max;
        this.reduce = object.reduce;
        this.reduceFactor = object.reduceFactor;
        this.value = object.value;
    }

    /**
     * @returns {String} name: value/max
     */
    toString() {
        return this.name + ": " + parseInt(this.value) + " / " + parseInt(this.max);
    }

    /**
     * 当前数值百分比
     * @returns {Number} 数值百分比
     */
    getPercent() {
        return this.value / this.max;
    }

    /**
     * 缺乏程度
     */
    getDegreeOfLack() {
        if (this.value <= 0) return 3;
        if (this.getPercent() < 0.2) return 1;
        else return 0;
    }

    isFull() {
        return (this.value >= this.max)
    }

    timeTick() {
        this.value -= this.reduce * this.reduceFactor;
        if (this.value <= 0) this.value = 0;
    }

    addValue(num) {
        if (num < 0) this.value += num;
        else this.value += num * Math.sqrt(1 / this.reduceFactor);
        if (this.value > this.max) this.value = this.max;
        if (this.value <= 0) this.value = 0;
    }

    /**
     * 按百分比增加
     * @param {Number} percent (<= 1.0)
     */
    addValuePer(percent) {
        this.addValue(this.max * percent);
    }

    upgrade(num = 100) {
        // 升级max+100，value保持原百分比
        let percent = this.getPercent();
        this.max += num;
        this.value = this.max * percent;
    }
}

class PetLevel {
    constructor() {
        this.level = 1;
        this.value = 0;
        this.maxExp = 100;
    }

    read(object) {
        this.level = object.level;
        this.value = object.value;
        this.maxExp = object.maxExp;
        this.stage = 0; // 0: 幼猫  1: 猫  2:猫娘
    }

    upgrade() {
        this.level += 1;
        this.value = 0;
        this.maxExp = this.level * 100;

        const minLevel = [0, 10, 100];
        minLevel.map((value, index) => {
            if (this.level >= value) this.stage = index;
        })
    }

    /**
     * 增加经验值
     * @param {Number} num 经验值
     * @returns {Boolean} 是否升级
     */
    addExp(num) {
        this.value += num;
        if (this.value > this.maxExp) {
            this.upgrade();
            return true;
        }
        return false;
    }

    getStageName() {
        const stageName = ["幼猫", "成年", "猫娘"];
        return stageName[this.stage];
    }

    /**
     * @returns {String} 等级: level (value/maxExp)
     */
    toString() {
        return "等级: " + this.level + " (" + parseInt(this.value) + " / " + parseInt(this.maxExp) + ")";
    }
}


class Pet {
    /**
     * @param {Number} masterId qqId/群Id
     * @param {"Private"|"Group"} masterType 
     * @param {Number} petId
     */
    constructor(masterId, masterType, petId) {
        this.masterId = masterId;
        this.masterType = masterType;
        this.petId = petId;

        this.isActive = false;
        this.petStatus = PetStatus.doNothing;
        this.name = "";
        this.birthday = new Date();
        // TODO
        /*
        this.race = "";
        this.color = "";
        this.weight = 0;
        */
        this.level = new PetLevel();
        this.stats = {
            // 饥饿值
            hungry: new PetStat("喂食", this.randomInt(100, 300), 2),
            // 干渴值
            thirsty: new PetStat("饮水", this.randomInt(100, 300), 2),
            // 健康值
            healthy: new PetStat("健康", this.randomInt(100, 300), 2),
            // 精力值
            energy: new PetStat("精力", this.randomInt(100, 300), 2),
            // 心情值
            mood: new PetStat("心情", this.randomInt(100, 300), 2),
        };
        this.interval = 1000 * 30 * 1;
        this.sleepFill = 0.01;
        this.growth = {
            // 成长系数，成长值 = 成长系数 * 10
            hungry: this.randomInt(1, 10),
            thirsty: this.randomInt(1, 10),
            healthy: this.randomInt(1, 10),
            energy: this.randomInt(1, 10),
            mood: this.randomInt(1, 10),
        };

    }

    load(storage) {
        this.masterId = storage.masterId;
        this.masterType = storage.masterType;
        this.petId = storage.petId;

        this.isActive = storage.isActive;
        this.petStatus = storage.petStatus;
        this.name = storage.name;
        this.birthday = new Date(storage.birthday);
        this.level = new PetLevel().read(storage.level);
        this.stats = {
            hungry: new PetStat().read(storage.stats.hungry),
            thirsty: new PetStat().read(storage.stats.thirsty),
            healthy: new PetStat().read(storage.stats.healthy),
            energy: new PetStat().read(storage.stats.energy),
            mood: new PetStat().read(storage.stats.mood),
        };
        this.interval = storage.interval;
        this.sleepFill = storage.sleepFill;
        this.growth = storage.growth;

        if (this.isActive) this.active(this.interval);
    }

    /**
     * 生成随机数[min, max]
     * @param {Number} min 最小值
     * @param {Number} max 最大值
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    timeTickNormal() {
        let hungryDegree = this.stats.hungry.getDegreeOfLack();
        let thirstyDegree = this.stats.thirsty.getDegreeOfLack();
        // 计算健康值减少系数，正常情况下不掉健康值
        this.stats.healthy.reduceFactor = (hungryDegree + thirstyDegree) / 5;
        // 计算心情值减少系数
        let healthyDegree = this.stats.healthy.getDegreeOfLack();
        this.stats.mood.reduceFactor = 1.0 + healthyDegree / 2;
        // 计算精力值减少系数
        this.stats.energy.reduceFactor = 1.0 + (hungryDegree + thirstyDegree + healthyDegree) / 2;
        // 增加经验值
        let moodDegree = this.stats.mood.getDegreeOfLack();
        let addExpValue = (5 - hungryDegree - thirstyDegree - healthyDegree) * (1.5 - moodDegree / 3);
        if (addExpValue < 0) addExpValue = 0;
        let isUpgrade = this.level.addExp(addExpValue);

        for (let stat in this.stats) {
            if (this.stats.hasOwnProperty(stat)) {
                // 减少状态
                this.stats[stat].timeTick();
                // 升级增加最大值
                if (isUpgrade) this.stats[stat].upgrade(this.growth[stat] * 10);
            }
        }
        if (this.stats.energy.getDegreeOfLack() > 0) {
            // 睡觉
            this.sleep();
        }
    }

    timeTickSleeping() {
        // 睡觉只补充精力，其他项不变动
        this.stats.energy.addValuePer(this.sleepFill);
        if (this.stats.energy.isFull()) {
            this.awake();
        }
    }

    timeTick() {
        switch (this.petStatus) {
            case PetStatus.doNothing: { timeTickNormal(); break; }
            case PetStatus.sleeping: { timeTickSleeping(); break; }
            default: { timeTickNormal(); break; }
        }
    }

    setName(name) {
        this.name = name;
    }

    showStats() {
        let output = "";
        output += "名字: " + this.name + "\n";
        output += "生日: " + this.birthday.toLocaleDateString() + "\n";
        output += this.level.toString() + "\n";
        for (let stat in this.stats) {
            if (this.stats.hasOwnProperty(stat)) output += this.stats[stat].toString() + "\n";
        }
        return output;
    }

    // ------------------------------活动------------------------------
    eat(addPercent) {
        this.stats.hungry.addValuePer(addPercent);
    }

    drink(addPercent) {
        this.stats.thirsty.addValuePer(addPercent);
    }

    play(degree) {
        this.stats.hungry.addValue(-100 * degree);
        this.stats.thirsty.addValue(-100 * degree);
        this.stats.mood.addValuePer(0.2 * degree);
    }

    cure() {
        this.stats.healthy.addValuePer(0.7);
        this.stats.mood.addValue(-500);
    }

    sleep() {
        this.petStatus = PetStatus.sleeping;
    }

    awake() {
        this.petStatus = PetStatus.doNothing;
    }

    working() {
        this.petStatus = PetStatus.working;
    }

    studying() {
        this.petStatus = PetStatus.studying;
    }

    // ------------------------------驱使活动，根据当前状态和亲密度判定效果------------------------------

    /**
     * 喂食
     * @param {Number} foodValue 填充百分比 0~1
     * @param {Number} relationship 关系度 -1~1，决定了成功率
     * @returns {{success: Boolean, detail: String}}
     */
    toEat(foodValue, relationship) {
        if (!this.isActive) return {success: false, detail: this.name + "还在冻结中，请先解冻"};
        if (this.petStatus === PetStatus.sleeping) return {success: false, detail: this.name + "还在睡觉"};

        // 幼猫受关系度影响较小
        let successProbability = (this.level.stage + 1.0)/ 3 * (((relationship + 1.0) / 2) - 1) + 1;
        // 亲密度不够
        if (Math.random()> successProbability) return {success: false, detail: Performance.give_food_fail_relation(this.name, this.level.stage)};
        // 不饿
        if (this.stats.hungry.getPercent() > 0.95) return {success: false, detail: Performance.give_food_fail_notHungry(this.name, this.level.stage)};
        // 吃了
        this.stats.hungry.addValuePer(foodValue);
        let per = this.stats.hungry.getPercent();
        if (per < 0.7) return {success: true, detail: "狼吞虎咽地吃完了"};
        else return {success: true, detail: "吃完了"};
    }

    // TODO


    // ------------------------------冻结------------------------------
    active(interval = this.interval) {
        this.interval = interval;
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeTick();
        }, interval);
        this.isActive = true;
        return "已解冻" + this.name;
    }

    deactive() {
        clearInterval(this.timer);
        this.isActive = false;
        return "已冻结" + this.name;
    }
}

module.exports = Pet;