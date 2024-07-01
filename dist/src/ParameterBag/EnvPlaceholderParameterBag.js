"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvPlaceholderParameterBag = void 0;
const sprintf_1 = __importDefault(require("locutus/php/strings/sprintf"));
const strtr_1 = __importDefault(require("locutus/php/strings/strtr"));
const Container_1 = require("../Container");
const DefaultParameterBag_1 = require("./DefaultParameterBag");
class EnvPlaceholderParameterBag extends DefaultParameterBag_1.DefaultParameterBag {
    constructor() {
        super(...arguments);
        this.envPlaceholderUniquePrefix = null;
        this.envPlaceholders = {};
        this.unusedEnvPlaceholders = {};
        this.providedTypes = {};
        //  /**
        //  * Merges the env placeholders of another EnvPlaceholderParameterBag.
        //  */
        //   public mergeEnvPlaceholders(bag: EnvPlaceholderParameterBag)
        //   {
        //       var newPlaceholders: any;
        //       if (newPlaceholders = bag.getEnvPlaceholders()) {
        //           this.envPlaceholders += newPlaceholders;
        //           for(const env in newPlaceholders) {
        //             const placeholders = newPlaceholders[env];
        //             this.envPlaceholders[env] += placeholders;
        //           }
        //       }
        //       var newUnusedPlaceholders: any;
        //       if (newUnusedPlaceholders = bag.getUnusedEnvPlaceholders()) {
        //           this.unusedEnvPlaceholders += newUnusedPlaceholders;
        //           for(const env in newUnusedPlaceholders) {
        //             const placeholders = newUnusedPlaceholders[env];
        //               this.unusedEnvPlaceholders[env] += placeholders;
        //           }
        //       }
        //   }
    }
    /**
     * {@inheritdoc}
     */
    get(name) {
        // console.info('resolving: ', name);
        if (name.startsWith('env(') && name.endsWith(')') && 'env()' != name) {
            var env = name.substring(4, -1);
            if ((env in this.envPlaceholders)) {
                for (const index in this.envPlaceholders[env]) {
                    const placeholder = this.envPlaceholders[env][index];
                    return placeholder; // return first result
                }
            }
            else {
                this.envPlaceholders[env] = {};
            }
            if ((env in this.unusedEnvPlaceholders)) {
                for (const index in this.unusedEnvPlaceholders[env]) {
                    const placeholder = this.unusedEnvPlaceholders[env][index];
                    return placeholder; // return first result
                }
            }
            if (!/^(?:[-.\w]*:)*\w+/.test(env)) {
                throw new Container_1.InvalidArgumentException((0, sprintf_1.default)('Invalid %s name: only "word" characters are allowed.', name));
            }
            var defaultValue;
            if (this.has(name) && null !== (defaultValue = super.get(name)) && !(typeof defaultValue == 'string')) {
                throw new Container_1.RuntimeException((0, sprintf_1.default)('The default value of an env() parameter must be a string or null, but "%s" given to "%s".', typeof (defaultValue), name));
            }
            // const uniqueName = (JSON.stringify(name + '_' + EnvPlaceholderParameterBag.counter++));//md5(name.'_'.self::counter++);
            const uniqueName = encodeURI(name + '_' + EnvPlaceholderParameterBag.counter++);
            const placeholder = (0, sprintf_1.default)('%s_%s_%s', this.getEnvPlaceholderUniquePrefix(), (0, strtr_1.default)(env, ':-.', '___'), uniqueName);
            this.envPlaceholders[env][placeholder] = placeholder;
            return placeholder;
        }
        // if (str_starts_with(name, 'env(') && str_ends_with(name, ')') && 'env()' !== name) {
        //     env = substr(name, 4, -1);
        //     if (isset(this.envPlaceholders[env])) {
        //         foreach (this.envPlaceholders[env] as placeholder) {
        //             return placeholder; // return first result
        //         }
        //     }
        //     if (isset(this.unusedEnvPlaceholders[env])) {
        //         foreach (this.unusedEnvPlaceholders[env] as placeholder) {
        //             return placeholder; // return first result
        //         }
        //     }
        //     if (!preg_match('/^(?:[-.\w]*+:)*+\w++/', env)) {
        //         throw new InvalidArgumentException(sprintf('Invalid %s name: only "word" characters are allowed.', name));
        //     }
        //     if (this.has(name) && null !== (defaultValue = parent::get(name)) && !\is_string(defaultValue)) {
        //         throw new RuntimeException(sprintf('The default value of an env() parameter must be a string or null, but "%s" given to "%s".', get_debug_type(defaultValue), name));
        //     }
        //     uniqueName = md5(name.'_'.self::counter++);
        //     placeholder = sprintf('%s_%s_%s', this.getEnvPlaceholderUniquePrefix(), strtr(env, ':-.', '___'), uniqueName);
        //     this.envPlaceholders[env][placeholder] = placeholder;
        //     return placeholder;
        // }
        return super.get(name);
    }
    /**
     * Gets the common env placeholder prefix for env vars created by this bag.
     */
    getEnvPlaceholderUniquePrefix() {
        // if (null === this.envPlaceholderUniquePrefix) {
        //     reproducibleEntropy = unserialize(serialize(this.parameters));
        //     array_walk_recursive(reproducibleEntropy,  (&v) { v = null; });
        //     this.envPlaceholderUniquePrefix = 'env_'.substr(md5(serialize(reproducibleEntropy)), -16);
        // }
        return this.envPlaceholderUniquePrefix;
    }
    /**
     * Returns the map of env vars used in the resolved parameter values to their placeholders.
     *
     * @return string[][] A map of env var names to their placeholders
     */
    getEnvPlaceholders() {
        return this.envPlaceholders;
    }
    getUnusedEnvPlaceholders() {
        return this.unusedEnvPlaceholders;
    }
    clearUnusedEnvPlaceholders() {
        this.unusedEnvPlaceholders = [];
    }
    /**
     * Merges the env placeholders of another EnvPlaceholderParameterBag.
     */
    mergeEnvPlaceholders(bag) {
        var newPlaceholders;
        var newUnusedPlaceholders;
        if (newPlaceholders = bag.getEnvPlaceholders()) {
            Object.assign(this.envPlaceholders, newPlaceholders);
            for (const env in newPlaceholders) {
                const placeholders = newPlaceholders[env];
                this.envPlaceholders[env] += placeholders;
            }
        }
        if (newUnusedPlaceholders = bag.getUnusedEnvPlaceholders()) {
            Object.assign(this.unusedEnvPlaceholders, newUnusedPlaceholders);
            for (const env in newUnusedPlaceholders) {
                const placeholders = newPlaceholders[env];
                this.unusedEnvPlaceholders[env] += placeholders;
            }
        }
    }
    /**
     * Maps env prefixes to their corresponding PHP types.
     */
    setProvidedTypes(providedTypes) {
        this.providedTypes = providedTypes;
    }
    /**
     * Gets the PHP types corresponding to env() parameter prefixes.
     *
     * @return string[][]
     */
    getProvidedTypes() {
        return this.providedTypes;
    }
    /**
     * {@inheritdoc}
     */
    resolve() {
        if (this.resolved) {
            return;
        }
        super.resolve();
        for (const env in this.envPlaceholders) {
            const placeholders = this.envPlaceholders[env];
            var name;
            var _default;
            if (this.has(name = "env(env)") && null !== (_default = this.parameters.get(name)) && !(typeof _default == 'string')) {
                throw new Container_1.RuntimeException(`The default value of env parameter "{env}" must be a string or null, "{typeof _default}" given.`);
            }
        }
    }
}
exports.EnvPlaceholderParameterBag = EnvPlaceholderParameterBag;
EnvPlaceholderParameterBag.counter = 0;
exports.default = EnvPlaceholderParameterBag;
