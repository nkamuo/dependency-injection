"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceLocatorArgument = void 0;
const Container_1 = require("../Container");
const Reference_1 = require("../Reference");
const Argument_1 = require("./Argument");
const TaggedIteratorArgument_1 = require("./TaggedIteratorArgument");
class ServiceLocatorArgument extends Argument_1.Argument {
    /**
     * @param Reference[]|TaggedIteratorArgument $values
     */
    constructor(values = []) {
        super();
        // use ReferenceSetArgumentTrait;
        this.values = [];
        this.taggedIteratorArgument = null;
        if (values instanceof TaggedIteratorArgument_1.TaggedIteratorArgument) {
            this.taggedIteratorArgument = values;
            this.values = [];
        }
        else {
            this.setValues(values);
        }
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
    getTaggedIteratorArgument() {
        return this.taggedIteratorArgument;
    }
}
exports.ServiceLocatorArgument = ServiceLocatorArgument;
exports.default = ServiceLocatorArgument;
