"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extension = void 0;
const Container_1 = require("../Container");
class Extension {
    constructor() {
        this.processedConfigs = {};
    }
    // tslint:disable-next-line:no-empty
    prepend(container) { }
    /**
     * {@inheritdoc}
     */
    getXsdValidationBasePath() {
        return false;
    }
    /**
     * {@inheritdoc}
     */
    getNamespace() {
        return 'http://example.org/schema/dic/' + this.getAlias();
    }
    /**
     * Returns the recommended alias to use in XML.
     *
     * This alias is also the mandatory prefix to use when using YAML.
     *
     * This convention is to remove the "Extension" postfix from the class
     * name and then lowercase and underscore the result. So:
     *
     *     AcmeHelloExtension
     *
     * becomes
     *
     *     acme_hello
     *
     * This can be overridden in a sub-class to specify the alias manually.
     *
     * @return string
     *
     * @throws BadMethodCallException When the extension name does not follow conventions
     */
    getAlias() {
        return this.constructor.name.toUpperCase();
    }
    /**
     * {@inheritdoc}
     */
    getConfiguration(config, container) {
        throw new Error('Please Set extension configuration method');
    }
    /**
     * @internal
     */
    getProcessedConfigs() {
        try {
            return this.processedConfigs;
        }
        finally {
            this.processedConfigs = [];
        }
    }
    /**
     * @return bool
     *
     * @throws InvalidArgumentException When the config is not enableable
     */
    isConfigEnabled(container, config) {
        if (!('enabled' in config)) {
            throw new Container_1.InvalidArgumentException('The config array has no \'enabled\' key.');
        }
        return Boolean(container.getParameterBag().resolveValue(config.enabled));
    }
    processConfiguration(configuration, configs) {
        throw new Error('Please Set extension configuration method');
        // processor = new Processor();
        // return this.processedConfigs[] = processor.processConfiguration(configuration, configs);
        // return {};
    }
}
exports.Extension = Extension;
exports.default = Extension;
