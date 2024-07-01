"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parameter = void 0;
class Parameter {
    constructor(id) {
        this.id = id;
    }
    /**
     * @return string
     */
    toString() {
        return this.id;
    }
}
exports.Parameter = Parameter;
exports.default = Parameter;
