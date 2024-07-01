"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceClosureArgument = void 0;
const Container_1 = require("../Container");
const Reference_1 = require("../Reference");
const Argument_1 = require("./Argument");
class ServiceClosureArgument extends Argument_1.Argument {
    constructor(reference, method) {
        super();
        this.values = [];
        this.values = [reference];
        this.method = method;
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
    setValues(values, method) {
        if ((values.length !== 1 || [undefined, null].includes(values[0])) || !(values[0] instanceof Reference_1.Reference || null === values[0])) {
            throw new Container_1.InvalidArgumentException('A ServiceClosureArgument must hold one and only one Reference.');
        }
        this.values = values;
        if (method)
            this.setMethod(method);
    }
    getMethod() {
        return this.method;
    }
    setMethod(method) {
        this.method = method;
    }
}
exports.ServiceClosureArgument = ServiceClosureArgument;
exports.default = ServiceClosureArgument;
