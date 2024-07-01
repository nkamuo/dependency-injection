"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedReference = void 0;
const Container_1 = require("./Container");
const Reference_1 = require("./Reference");
class TypedReference extends Reference_1.Reference {
    constructor(id, type, invalidBehavior = Container_1.InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE, name = null) {
        super(id, invalidBehavior);
        this.type = type;
        this.name = name;
    }
    getType() {
        return this.type;
    }
}
exports.TypedReference = TypedReference;
exports.default = TypedReference;
