"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Container_1 = require("../Container");
const Reference_1 = require("../Reference");
class ReferenceSetArgumentTrait {
    constructor(reference) {
        this.values = [];
        this.values = [reference];
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
