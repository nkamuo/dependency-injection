"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildDefinition = void 0;
const Container_1 = require("./Container");
const Definition_1 = require("./Definition");
class ChildDefinition extends Definition_1.Definition {
    /**
     * @param parent string parent The id of Definition instance to decorate
     */
    constructor(parent) {
        super();
        this.parent = parent;
    }
    /**
     * Returns the Definition to inherit from.
     *
     * @return string
     */
    getParent() {
        return this.parent;
    }
    /**
     * Sets the Definition to inherit from.
     *
     * @return this
     */
    setParent(parent) {
        this.parent = parent;
        return this;
    }
    /**
     * Gets an argument to pass to the service constructor/factory method.
     *
     * If replaceArgument() has been used to replace an argument, this method
     * will return the replacement value.
     *
     * @param int|string index
     *
     * @return mixed
     *
     * @throws OutOfBoundsException When the argument does not exist
     */
    getArgument(index) {
        if (('index_' + index in this.arguments)) {
            return this.arguments['index_' + index];
        }
        return super.getArgument(index);
    }
    /**
     * You should always use this method when overwriting existing arguments
     * of the parent definition.
     *
     * If you directly call setArguments() keep in mind that you must follow
     * certain conventions when you want to overwrite the arguments of the
     * parent definition, otherwise your arguments will only be appended.
     *
     * @param int|string index
     * @param mixed      value
     *
     * @return this
     *
     * @throws InvalidArgumentException when index isn't an integer
     */
    replaceArgument(index, value) {
        if ((typeof index === 'number')) {
            this.arguments['index_' + index] = value;
        }
        else if (index.startsWith('')) {
            this.arguments[index] = value;
        }
        else {
            throw new Container_1.InvalidArgumentException('The argument must be an existing index or the name of a constructor\'s parameter.');
        }
        return this;
    }
}
exports.ChildDefinition = ChildDefinition;
exports.default = ChildDefinition;
