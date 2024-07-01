"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IteratorArgument = void 0;
const Container_1 = require("../Container");
const Reference_1 = require("../Reference");
const Argument_1 = require("./Argument");
class IteratorArgument extends Argument_1.Argument {
    constructor(values) {
        super();
        this.values = [];
        this.setValues(values);
    }
    /**
     * {@inheritdoc}
     */
    getValues() {
        return this.values;
    }
    /**
     * @param Reference[] values The service references to put in the set
     */
    setValues(values) {
        for (const k in values) {
            const v = values[k];
            if (null !== v && !(v instanceof Reference_1.Reference)) {
                throw new Container_1.InvalidArgumentException(`A "%s" must hold only Reference instances, "%s" given.`);
            }
        }
        this.values = values;
    }
}
exports.IteratorArgument = IteratorArgument;
exports.default = IteratorArgument;
