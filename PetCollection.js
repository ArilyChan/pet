'use strict';

const Pet = require("./Pet");
const Master = require("./Master");
const Relationship = require("./Relationship");

class PetCollection{
    constructor() {
        // pet和master的数量不一定相同，因为master可能会丢弃pet生成其他pet，所以pet的数量应大于等于master的数量
        this.maxPetId = 0;
        this.pet = [];
        this.master = [];
        this.relationship = [];

        this.searchPet = {}; // searchPet[masterId+masterType] = index of this.pet
    }

    load(storage) {
        this.maxPetId = storage.maxPetId;
        storage.pet.map((onepet) => {
            this.pet.push(new Pet().load(onepet));
        });
        storage.master.map((onemaster) => {
            this.master.push(new Master().load(onemaster));
        });
        storage.relationship.map((onerelationship) => {
            this.relationship.push(new Relationship().load(onerelationship));
        });
        this.buildIndex();
    }

    /**
     * 重构索引
     */
    buildIndex() {
        this.pet.map((onepet, index) => {
            this.searchPet[onepet.masterId.toString() + onepet.masterType] = index;
        });
    }

    addPetForMaster() {
        // TODO
    }
}


module.exports = PetCollection;