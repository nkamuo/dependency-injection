"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractArgument = void 0;
const Argument_1 = require("./Argument");
class AbstractArgument extends Argument_1.Argument {
    constructor(text = '') {
        super();
        text = text.replace(/([\.\s]+)$/, '');
        this.text = text.replace(/^([\.\s]+)/, '');
    }
    setContext(context) {
        this.context = context + ' is abstract' + ('' === this.text ? '' : ': ');
    }
    getText() {
        return this.text;
    }
    getTextWithContext() {
        return this.context + this.text + '.';
    }
}
exports.AbstractArgument = AbstractArgument;
exports.default = AbstractArgument;
