'use strict';

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
        if (this.getPercent() < 0.3) return 1;
        else return 0;
    }

    timeTick() {
        this.value -= this.reduce * this.reduceFactor;
        if (this.value <= 0) this.value = 0;
        return this;
    }

    addValue(num) {
        if (num < 0) this.value += num;
        else this.value += num * Math.sqrt(1 / this.reduceFactor);
        if (this.value > this.max) this.value = this.max;
        if (this.value <= 0) this.value = 0;
        return this;
    }

    addValuePer(percent) {
        return this.addValue(this.max * percent);
    }

    upgrade() {
        // 升级max+100，value保持原百分比
        let percent = this.getPercent();
        this.max += 100;
        this.value = this.max * percent;
    }
}

class PetLevel {
    constructor() {
        this.level = 1;
        this.value = 0;
        this.maxExp = 1000;
    }

    upgrade() {
        this.level += 1;
        this.value = 0;
        this.maxExp = this.level * 1000;
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

    /**
     * @returns {String} 等级: level (value/maxExp)
     */
    toString() {
        return "等级: " + this.level + " (" + parseInt(this.value) + " / " + parseInt(this.maxExp) + ")";
    }
}


class Pet {
    constructor() {
        this.name = "";
        this.birthday = new Date();
        this.race = ""; // TODO
        this.color = ""; // TODO
        this.level = new PetLevel();
        this.stats = {
            // 饥饿值
            hungry: new PetStat("喂食", this.random(500, 1500), this.random(1, 5)),
            // 干渴值
            thirsty: new PetStat("饮水", this.random(500, 1500), this.random(1, 5)),
            // 健康值
            healthy: new PetStat("健康", this.random(500, 1500), this.random(1, 2)),
            // 心情值
            mood: new PetStat("心情", this.random(500, 1500), this.random(1, 5)),
        };

    }

    /**
     * 生成随机数[min, max]
     * @param {Number} min 最小值
     * @param {Number} max 最大值
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    timeTick() {
        let hungryDegree = this.stats.hungry.getDegreeOfLack();
        let thirstyDegree = this.stats.thirsty.getDegreeOfLack();
        // 计算健康值减少系数
        this.stats.healthy.reduceFactor = 1.0 + (hungryDegree + thirstyDegree) / 5;
        // 计算心情值减少系数
        let healthyDegree = this.stats.healthy.getDegreeOfLack();
        this.stats.mood.reduceFactor = 1.0 + healthyDegree / 2;
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
                if (isUpgrade) this.stats[stat].upgrade();
            }
        }
    }

    setName(name) {
        this.name = name;
    }

    showStats() {
        let output = "";
        output += "名字: " + this.name + "\n";
        output += "生日: " + this.birthday.toDateString() + "\n";
        output += this.level.toString() + "\n";
        for (let stat in this.stats) {
            if (this.stats.hasOwnProperty(stat)) output += this.stats[stat].toString() + "\n";
        }
        return output;
    }

    // ------------------------------活动------------------------------
    eat() {
        if (this.stats.hungry.getPercent() > 0.95) return this.name + "还不想吃饭";
        this.stats.hungry.addValuePer(0.5);
        let per = this.stats.hungry.getPercent();
        if (per < 0.7) return this.name + "吃完啦，但是感觉还是有点饿";
        else if (per < 0.95) return this.name + "吃饱啦";
        else return this.name + "再也吃不下了";
    }

    drink() {
        if (this.stats.thirsty.getPercent() > 0.95) return this.name + "还不想喝水";
        this.stats.thirsty.addValuePer(0.5);
        let per = this.stats.thirsty.getPercent();
        if (per < 0.7) return this.name + "把水喝光了，好像还不够";
        else if (per < 0.95) return this.name + "喝完了水";
        else return this.name + "再也喝不下了";
    }

    play() {
        this.stats.hungry.addValue(-100);
        this.stats.thirsty.addValue(-100);
        this.stats.mood.addValuePer(0.3);
        return "和" + this.name + "玩得很开心";
    }

    cure() {
        this.stats.healthy.addValuePer(0.7);
        this.stats.mood.addValue(-500);
        return "给" + this.name + "打针，" + this.name + "好像生气了QAQ";
    }


    // ------------------------------启动/停止------------------------------
    active(interval = 1000 * 60 * 1) {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeTick();
        }, interval);
        return "你的小可爱醒来啦！";
    }

    sleep() {
        clearInterval(this.timer);
        return "你的小可爱睡觉啦！";
    }
}

module.exports = Pet;