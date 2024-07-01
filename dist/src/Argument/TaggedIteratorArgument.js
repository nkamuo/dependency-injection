"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaggedIteratorArgument = void 0;
const IteratorArgument_1 = require("./IteratorArgument");
/**
 * Represents a collection of services found by tag name to lazily iterate over.
 *
 * @author Roland Franssen <franssen.roland@gmail.com>
 */
class TaggedIteratorArgument extends IteratorArgument_1.IteratorArgument {
    /**
     * @param string      tag                   The name of the tag identifying the target services
     * @param string|null indexAttribute        The name of the attribute that defines the key referencing each service in the tagged collection
     * @param string|null defaultIndexMethod    The static method that should be called to get each service's key when their tag doesn't define the previous attribute
     * @param bool        needsIndexes          Whether indexes are required and should be generated when computing the map
     * @param string|null defaultPriorityMethod The static method that should be called to get each service's priority when their tag doesn't define the "priority" attribute
     */
    constructor(tag, indexAttribute = null, defaultIndexMethod = null, needsIndexes = false, defaultPriorityMethod = null) {
        super([]);
        this._needsIndexes = false;
        if (null === indexAttribute && needsIndexes) {
            // indexAttribute = preg_match('/[^.]++/', tag, m) ? m[0] : tag;
            // var indexAttribute;?
            const matches = tag.match(/[^.]+/);
            if (matches) {
                indexAttribute = matches[0];
            }
        }
        this.tag = tag;
        this.indexAttribute = indexAttribute;
        this.defaultIndexMethod = defaultIndexMethod !== null && defaultIndexMethod !== void 0 ? defaultIndexMethod : (indexAttribute ? 'getDefault' + indexAttribute.replace('/[^a-zA-Z0-9\x7f-\xff]++/', ' ').toLocaleUpperCase().replace(' ', '') + 'Name' : null);
        this._needsIndexes = needsIndexes;
        this.defaultPriorityMethod = defaultPriorityMethod !== null && defaultPriorityMethod !== void 0 ? defaultPriorityMethod : (indexAttribute ? 'getDefault' + indexAttribute.replace('/[^a-zA-Z0-9\x7f-\xff]++/', ' ').toLocaleUpperCase().replace(' ', '') + 'Priority' : null);
    }
    getTag() {
        return this.tag;
    }
    getIndexAttribute() {
        return this.indexAttribute;
    }
    getDefaultIndexMethod() {
        return this.defaultIndexMethod;
    }
    needsIndexes() {
        return this._needsIndexes;
    }
    getDefaultPriorityMethod() {
        return this.defaultPriorityMethod;
    }
}
exports.TaggedIteratorArgument = TaggedIteratorArgument;
exports.default = TaggedIteratorArgument;
