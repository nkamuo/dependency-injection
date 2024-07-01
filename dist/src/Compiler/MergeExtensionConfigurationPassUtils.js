"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergeExtensionConfigurationContainerBuilder = exports.MergeExtensionConfigurationParameterBag = void 0;
const Container_1 = require("../Container");
const ContainerBuilder_1 = __importDefault(require("../ContainerBuilder"));
const EnvPlaceholderParameterBag_1 = require("../ParameterBag/EnvPlaceholderParameterBag");
const PassConfig_1 = require("./PassConfig");
// console.log('supper:ContainerBuilder => ',ContainerBuilder);
/**
 * @internal
 */
class MergeExtensionConfigurationParameterBag extends EnvPlaceholderParameterBag_1.EnvPlaceholderParameterBag {
    constructor(parameterBag) {
        super(parameterBag.all());
        this.processedEnvPlaceholders = {};
        this.mergeEnvPlaceholders(parameterBag);
    }
    freezeAfterProcessing(extension, container) {
        var config;
        if (!(config = extension.getProcessedConfigs())) {
            // Extension::processConfiguration() wasn't called, we cannot know how configs were merged
            return;
        }
        this.processedEnvPlaceholders = [];
        // serialize config and container to catch env vars nested in object graphs
        // config = serialize(config).serialize(container.getDefinitions()).serialize(container.getAliases()).serialize(container.getParameterBag().all());
        var basePlaceholders;
        for (const env in (basePlaceholders = super.getEnvPlaceholders())) {
            const placeholders = basePlaceholders[env];
            for (const placeholder of placeholders) {
                // if (false !== stripos(config, placeholder)) {
                if (new RegExp(`${placeholder}`).test(config)) {
                    this.processedEnvPlaceholders[env] = placeholders;
                    break;
                }
            }
        }
    }
    /**
     * {@inheritdoc}
     */
    getEnvPlaceholders() {
        var _a;
        return (_a = this.processedEnvPlaceholders) !== null && _a !== void 0 ? _a : super.getEnvPlaceholders();
    }
    getUnusedEnvPlaceholders() {
        const otherKeys = [...Object.keys(this.processedEnvPlaceholders)];
        return null == this.processedEnvPlaceholders ? [] :
            [...Object.keys(super.getEnvPlaceholders())].filter((key) => otherKeys.includes(key));
        ;
    }
}
exports.MergeExtensionConfigurationParameterBag = MergeExtensionConfigurationParameterBag;
/**
 * A container builder preventing using methods that wouldn't have any effect from extensions.
 *
 * @internal
 */
class MergeExtensionConfigurationContainerBuilder extends ContainerBuilder_1.default {
    constructor(extension, parameterBag = null) {
        super(parameterBag);
        this.extensionClass = extension.constructor;
        // this.extensionClass = \get_class(extension);
    }
    /**
     * {@inheritdoc}
     */
    addCompilerPass(pass, type = PassConfig_1.PassHookPoint.BEFORE_OPTIMIZATION, priority = 0) {
        throw new Container_1.RuntimeException(`You cannot add compiler pass "${typeof pass}" from extension "${this.extensionClass.name}". Compiler passes must be registered before the container is compiled.`);
    }
    /**
     * {@inheritdoc}
     */
    registerExtension(extension) {
        throw new Container_1.RuntimeException('You cannot register extension "%s" from "%s". Extensions must be registered before the container is compiled.');
    }
    /**
     * {@inheritdoc}
     */
    compile(resolveEnvPlaceholders = false) {
        throw new Container_1.RuntimeException(('Cannot compile the container in extension "%s".'));
    }
    /**
     * {@inheritdoc}
     */
    resolveEnvPlaceholders(value, format = null, usedEnvs = null) {
        if (true !== format || !(typeof value == null)) {
            return super.resolveEnvPlaceholders(value, format, usedEnvs);
        }
        const bag = this.getParameterBag();
        value = bag.resolveValue(value);
        if (!(bag instanceof EnvPlaceholderParameterBag_1.EnvPlaceholderParameterBag)) {
            return super.resolveEnvPlaceholders(value, format, usedEnvs);
        }
        var envPlaceholders;
        for (const env in (envPlaceholders = bag.getEnvPlaceholders())) {
            const placeholders = envPlaceholders[env];
            if (!env.includes(':')) {
                continue;
            }
            for (const placeholder of placeholders) {
                if (false !== new RegExp(placeholder).test(placeholder)) {
                    throw new Container_1.RuntimeException(`Using a cast in "env(${env})" is incompatible with resolution at compile time in "${this.extensionClass.name}". The logic in the extension should be moved to a compiler pass, or an env parameter with no cast should be used instead.`);
                }
            }
        }
        return super.resolveEnvPlaceholders(value, format, usedEnvs);
    }
}
exports.MergeExtensionConfigurationContainerBuilder = MergeExtensionConfigurationContainerBuilder;
