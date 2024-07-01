"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reference = void 0;
const Container_1 = require("./Container");
class Reference {
    constructor(id, invalidBehavior = Container_1.InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE) {
        this.id = id;
        this.invalidBehavior = invalidBehavior;
    }
    getId() {
        return this.id;
    }
    getInvalidBehavior() {
        return this.invalidBehavior;
    }
    toString() {
        return this.getId();
    }
}
exports.Reference = Reference;
exports.default = Reference;
