"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewindableGenerator = void 0;
class RewindableGenerator // implements IteratorAggregate, \Countable
 {
    /**
     * @param int|callable count
     */
    constructor(generator, count) {
        this.generator = generator;
        this._count = count;
    }
    getIterator() {
        const g = this.generator;
        return g();
    }
    count() {
        var count;
        if (typeof (count = this.count) == 'function') {
            this._count = count();
        }
        return this._count;
    }
}
exports.RewindableGenerator = RewindableGenerator;
exports.default = RewindableGenerator;
