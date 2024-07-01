"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergeExtensionConfigurationPass = void 0;
// import { ContainerBuilder } from "../ContainerBuilder";
const Extension_1 = require("../Extension/Extension");
const EnvPlaceholderParameterBag_1 = require("../ParameterBag/EnvPlaceholderParameterBag");
const MergeExtensionConfigurationPassUtils_1 = require("./MergeExtensionConfigurationPassUtils");
class MergeExtensionConfigurationPass {
    constructor(extensions) {
        this.extensions = [];
        if (extensions)
            this.extensions = extensions;
    }
    /**
     * {@inheritdoc}
     */
    process(container) {
        const parameters = container.getParameterBag().all();
        const definitions = container.getDefinitions();
        const aliases = container.getAliases();
        const exprLangProviders = container.getExpressionLanguageProviders();
        const configAvailable = false;
        // const configAvailable = class_exists(BaseNode::class);
        var tmpContainer;
        const extensions = container.getExtensions();
        /** @var Extension */
        for (const index in extensions) {
            const extension = extensions[index];
            if (extension instanceof Extension_1.Extension) { //PrependExtensionInterface
                extension.prepend(container);
            }
        }
        for (const name in extensions) {
            const extension = extensions[name];
            var config;
            if (!(config = container.getExtensionConfig(name))) {
                // this extension was not called
                continue;
            }
            var resolvingBag = container.getParameterBag();
            if (resolvingBag instanceof EnvPlaceholderParameterBag_1.EnvPlaceholderParameterBag && extension instanceof Extension_1.Extension) {
                // create a dedicated bag so that we can track env vars per-extension
                resolvingBag = new MergeExtensionConfigurationPassUtils_1.MergeExtensionConfigurationParameterBag(resolvingBag);
                if (configAvailable) {
                    // BaseNode::setPlaceholderUniquePrefix(resolvingBag.getEnvPlaceholderUniquePrefix());
                }
            }
            config = resolvingBag.resolveValue(config);
            try {
                tmpContainer = new MergeExtensionConfigurationPassUtils_1.MergeExtensionConfigurationContainerBuilder(extension, resolvingBag);
                tmpContainer.addDefinitions(definitions); //TODO: Remove this call
                tmpContainer.addAliases(aliases);
                // tmpContainer.p
                tmpContainer.setResourceTracking(container.isTrackingResources());
                // tmpContainer.addObjectResource(extension);
                // if (extension instanceof ConfigurationExtensionInterface && null !== (configuration = extension.getConfiguration(config, tmpContainer))) {
                //     tmpContainer.addObjectResource(configuration);
                // }
                // for(const provider of exprLangProviders) {
                //     // tmpContainer.addExpressionLanguageProvider(provider);
                // }
                tmpContainer = container;
                extension.load(config, tmpContainer);
            }
            catch (e) {
                const parameterBag = container.getParameterBag();
                if (resolvingBag instanceof MergeExtensionConfigurationPassUtils_1.MergeExtensionConfigurationParameterBag && (parameterBag instanceof EnvPlaceholderParameterBag_1.EnvPlaceholderParameterBag)) {
                    parameterBag.mergeEnvPlaceholders(resolvingBag);
                }
                throw e;
            }
            if (resolvingBag instanceof MergeExtensionConfigurationPassUtils_1.MergeExtensionConfigurationParameterBag) {
                // don't keep track of env vars that are *overridden* when configs are merged
                resolvingBag.freezeAfterProcessing(extension, tmpContainer);
            }
            container.merge(tmpContainer);
            container.getParameterBag().add(parameters);
        }
        container.addDefinitions(definitions);
        container.addAliases(aliases);
    }
}
exports.MergeExtensionConfigurationPass = MergeExtensionConfigurationPass;
