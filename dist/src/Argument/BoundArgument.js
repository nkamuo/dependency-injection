"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundArgument = void 0;
const Argument_1 = require("./Argument");
class BoundArgument extends Argument_1.Argument {
    constructor(value, trackUsage = true, type = 0, file = null) {
        super();
        this.used = false;
        this.value = value;
        if (trackUsage) {
            this.identifier = ++BoundArgument.sequence;
        }
        else {
            this.used = true;
        }
        this.type = type;
        this.file = file;
    }
    /**
     * {@inheritdoc}
     */
    getValues() {
        return [this.value, this.identifier, this.used, this.type, this.file];
    }
    /**
     * {@inheritdoc}
     */
    setValues(values) {
        if (5 === values.length) {
            [this.value, this.identifier, this.used, this.type, this.file] = values;
        }
        else {
            [this.value, this.identifier, this.used] = values;
        }
    }
}
exports.BoundArgument = BoundArgument;
BoundArgument.SERVICE_BINDING = 0;
BoundArgument.DEFAULTS_BINDING = 1;
BoundArgument.INSTANCEOF_BINDING = 2;
BoundArgument.sequence = 0;
exports.default = BoundArgument;
