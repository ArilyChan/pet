'use strict';

class Master{
    constructor(masterId, masterType) {
        this.masterId = masterId;
        this.masterType = masterType;
        this.petId = -1;
    }

    load(storage) {
        this.masterId = storage.masterId;
        this.masterType = storage.masterType;
        this.petId = storage.petId;
    }
}

module.exports = Master;