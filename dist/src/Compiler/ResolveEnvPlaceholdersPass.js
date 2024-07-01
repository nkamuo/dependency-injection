"use strict";
// import AbstractRecursivePass from './AbstractRecursivePass';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveEnvPlaceholdersPass = void 0;
const Definition_1 = require("../Definition");
const AbstractRecursivePass_1 = require("./AbstractRecursivePass");
class ResolveEnvPlaceholdersPass extends AbstractRecursivePass_1.AbstractRecursivePass {
    processValue(value, isRoot = false) {
        // return value;
        // console.log('proccessing: ', value);
        const originalValue = value;
        if ((typeof value == 'string')) {
            return this.container.resolveEnvPlaceholders(value, true);
        }
        if (value instanceof Definition_1.Definition) {
            const changes = value.getChanges();
            if (('service_class' in changes)) {
                value.setClass(this.container.resolveEnvPlaceholders(value.getClass(), true));
            }
            if ('file' in changes) {
                value.setFile(this.container.resolveEnvPlaceholders(value.getFile(), true));
            }
        }
        value = super.processValue(value, isRoot);
        if (value && (typeof value === 'object' && (value.constructor === Object || Array.isArray(value))) && !isRoot) {
            const keys = this.container.resolveEnvPlaceholders(Reflect.ownKeys(value), true);
            const result /*{[i:string]: any}| Array<any>*/ = Array.isArray(value) ? [] : {};
            for (const k of keys)
                result[k] = value[k];
            value = result;
            // console.log('Finnal Result: ', result);
        }
        // console.log(`ResolveEnvPlaceholdersPass[]`,'originalValue: ',originalValue,'result: ', value);
        return value;
    }
}
exports.ResolveEnvPlaceholdersPass = ResolveEnvPlaceholdersPass;
exports.default = ResolveEnvPlaceholdersPass;
