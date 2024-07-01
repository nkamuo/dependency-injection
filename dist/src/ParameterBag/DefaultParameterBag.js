"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultParameterBag = void 0;
const sprintf_1 = __importDefault(require("locutus/php/strings/sprintf"));
const Container_1 = require("../Container");
class DefaultParameterBag {
    constructor(parameters, additional) {
        this.resolved = false;
        this.parameters = new Map();
        if (parameters)
            this.add(parameters);
    }
    clear() {
        this.parameters.clear();
    }
    add(parameters) {
        for (var key in parameters)
            this.parameters.set(key, parameters[key]);
    }
    all() {
        // return JSON.parse(this.parameters.) as  {[i: string]: any};
        const keys = this.parameters.keys();
        const data = {};
        for (const key of keys) {
            data[key] = this.parameters.get(key);
        }
        return data;
    }
    get(name) {
        if (!this.parameters.has(name))
            throw new Container_1.InvalidArgumentException((0, sprintf_1.default)(' Parameter "%s" does not exist in container', name));
        return this.parameters.get(name);
    }
    remove(name) {
        this.parameters.delete(name);
    }
    set(name, value) {
        this.parameters.set(name, value);
    }
    has(name) {
        return this.parameters.has(name);
    }
    resolve() {
        if (this.resolved) {
            return;
        }
        var parameters = [];
        // var _parameters = this.parameters.
        this.parameters.forEach((value, key) => {
            try {
                value = this.resolveValue(value);
                const resolvedValue = this.unescapeValue(value);
                parameters.push([key, resolvedValue]);
            }
            catch (e) {
                //ParameterNotFoundException
                // e.setSourceKey(key);
                throw e;
            }
        });
        // this.parameters = new Map(<Iterable<readonly [string, any]>>parameters);
        this.parameters.clear();
        for (const param of parameters)
            this.parameters.set(param[0], param[1]);
        this.resolved = true;
    }
    resolveValue(value, resolving = {}) {
        // console.log('input-resolve-value: ', value);
        if (value && (typeof value == 'object' && (value.constructor === Object || value instanceof Array))) {
            var result = Array.isArray(value) ? [] : {};
            for (var k in value) {
                const v = value[k];
                result[(typeof k == 'string') ? this.resolveValue(k, resolving) : k] = this.resolveValue(v, resolving);
            }
            // console.log('found: ', args);
            // console.log('output-resolve-value: ', args);
            return result;
        }
        if (!(typeof value == 'string') || 2 > value.length) {
            // console.log('output-resolve-value: ', value);
            return value;
        }
        // console.log('output-resolve-value: ', '[string]');
        return this.resolveString(value, resolving);
    }
    /**
        * Resolves parameters inside a string.
        *
        * @param array resolving An array of keys that are being resolved (used internally to detect circular references)
        *
        * @return mixed
        *
        * @throws ParameterNotFoundException          if a placeholder references a parameter that does not exist
        * @throws ParameterCircularReferenceException if a circular reference if detected
        * @throws RuntimeException                    when a given parameter has a type problem
        */
    resolveString(value, resolving = {}) {
        // we do this to deal with non string values (Boolean, integer, ...)
        // as the preg_replace_callback throw an exception when trying
        // a non-string in a parameter value
        const match = value.match(/^%([^%\s]+)%/);
        if (match) {
            const key = match[1];
            if (key in resolving) {
                //   throw new ParameterCircularReferenceException(array_keys(resolving));
                throw new Error("Circular reference in parameters: " + resolving.keys());
            }
            resolving[key] = true;
            return this.resolved ? this.get(key) : this.resolveValue(this.get(key), resolving);
        }
        const _this = this;
        if (!value.match(/%(.+?)%/))
            return value;
        try {
            return value.replace(/%%|%([^%\s]+)%/, function (allMatched, match) {
                // console.log('Value: ', value, 'match: ', match1);
                // skip %%
                //   if ((match[1])) {
                //       return '%%';
                //   }
                //   console.log('input: ', value, 'key: ', match);
                var key = match;
                if (key in resolving) {
                    console.log('Circular Reference: ', key);
                    throw new Error(resolving.join(', '));
                    //ParameterCircularReferenceException
                }
                var resolved = _this.get(key);
                //   console.log('resolved: ', resolved);
                if (!(typeof resolved == 'string') && !(typeof resolved == 'number')) {
                    throw new Error(`A string value must be composed of strings and/or numbers, but found parameter "%s" of type "%s" inside string value "%s".`);
                    //RuntimeException
                }
                resolved = String(resolved);
                resolving[key] = true;
                return _this.isResolved() ? resolved : _this.resolveString(resolved, resolving);
            });
        }
        catch (error) {
            console.log('Resolving: ', value);
            console.log(arguments);
            throw error;
        }
    }
    isResolved() {
        return this.resolved;
    }
    /**
     * {@inheritdoc}
     */
    escapeValue(value) {
        if ((typeof value == 'string')) {
            return value.replace('%', '%%');
        }
        if (value && (typeof value == 'object' && (value.constructor === Object || value instanceof Array))) {
            var result = Array.isArray(value) ? [] : {};
            for (const k in value) {
                const v = value[k];
                result[k] = this.escapeValue(v);
            }
            return result;
        }
        return value;
    }
    /**
     * {@inheritdoc}
     */
    unescapeValue(value) {
        if ((typeof value == 'string')) {
            return value.replace('%%', '%');
        }
        if (value && (typeof value == 'object' && (value.constructor === Object || value instanceof Array))) {
            var result = Array.isArray(value) ? [] : {};
            for (var k in value) {
                const v = value[k];
                result[k] = this.unescapeValue(v);
            }
            //   console.log('found-esc: ', result);
            return result;
        }
        return value;
    }
}
exports.DefaultParameterBag = DefaultParameterBag;
exports.default = DefaultParameterBag;
