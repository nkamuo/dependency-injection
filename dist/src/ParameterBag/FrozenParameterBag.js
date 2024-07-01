"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrozenParameterBag = void 0;
const DefaultParameterBag_1 = require("./DefaultParameterBag");
class LogicException extends Error {
}
;
class FrozenParameterBag extends DefaultParameterBag_1.DefaultParameterBag {
    constructor(parameters = {}) {
        super();
        // super.add(parameters);
        for (const key in parameters) {
            const value = parameters[key];
            this.parameters.set(key, value);
        }
        this.resolved = true;
    }
    /**
     * {@inheritdoc}
     */
    clear() {
        throw new LogicException('Impossible to call clear() on a frozen ParameterBag.');
    }
    /**
     * {@inheritdoc}
     */
    add(parameters) {
        throw new LogicException('Impossible to call add() on a frozen ParameterBag.');
    }
    /**
     * {@inheritdoc}
     */
    set(name, value) {
        throw new LogicException('Impossible to call set() on a frozen ParameterBag.');
    }
    remove(name) {
        throw new LogicException('Impossible to call remove() on a frozen ParameterBag.');
    }
}
exports.FrozenParameterBag = FrozenParameterBag;
exports.default = FrozenParameterBag;
