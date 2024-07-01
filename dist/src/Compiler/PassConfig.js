"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassConfig = exports.PassHookPoint = void 0;
const MergeExtensionConfigurationPass_1 = require("./MergeExtensionConfigurationPass");
var PassHookPoint;
(function (PassHookPoint) {
    PassHookPoint["AFTER_REMOVING"] = "afterRemoving";
    PassHookPoint["BEFORE_OPTIMIZATION"] = "beforeOptimization";
    PassHookPoint["BEFORE_REMOVING"] = "beforeRemoving";
    PassHookPoint["OPTIMIZE"] = "optimization";
    PassHookPoint["REMOVE"] = "removing";
})(PassHookPoint || (exports.PassHookPoint = PassHookPoint = {}));
/**
 * Compiler Pass Configuration.
 *
 * This class has a default configuration embedded.
 *
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */
class PassConfig {
    constructor() {
        this.afterRemovingPasses = [];
        this.beforeOptimizationPasses = [];
        this.beforeRemovingPasses = [];
        this.mergePass = new MergeExtensionConfigurationPass_1.MergeExtensionConfigurationPass();
        // this.beforeOptimizationPasses[100] = [];
        this.beforeOptimizationPasses[100] = [
        //     new ResolveClassPass(),
        //     new RegisterAutoconfigureAttributesPass(),
        //     new AttributeAutoconfigurationPass(),
        //     new ResolveInstanceofConditionalsPass(),
        //     new RegisterEnvVarProcessorsPass(),
        ];
        // this.beforeOptimizationPasses[-100] = [];
        this.beforeOptimizationPasses[-100] = [
        // new ExtensionCompilerPass()
        ];
        this.optimizationPasses = [[
            // autoAliasServicePass = new AutoAliasServicePass(),
            // new ValidateEnvPlaceholdersPass(),
            // new ResolveDecoratorStackPass(),
            // new ResolveChildDefinitionsPass(),
            // new RegisterServiceSubscribersPass(),
            // new ResolveParameterPlaceHoldersPass(false, false),
            // new ResolveFactoryClassPass(),
            // new ResolveNamedArgumentsPass(),
            // new AutowireRequiredMethodsPass(),
            // new AutowireRequiredPropertiesPass(),
            // new ResolveBindingsPass(),
            // new ServiceLocatorTagPass(),
            // new DecoratorServicePass(),
            // new CheckDefinitionValidityPass(),
            // new AutowirePass(false),
            // new ServiceLocatorTagPass(),
            // new ResolveTaggedIteratorArgumentPass(),
            // new ResolveServiceSubscribersPass(),
            // new ResolveReferencesToAliasesPass(),
            // new ResolveInvalidReferencesPass(),
            // new AnalyzeServiceReferencesPass(true),
            // new CheckCircularReferencesPass(),
            // new CheckReferenceValidityPass(),
            // new CheckArgumentsValidityPass(false),
            ]];
        this.removingPasses = [[
            // new RemovePrivateAliasesPass(),
            // (new ReplaceAliasByActualDefinitionPass()).setAutoAliasServicePass(autoAliasServicePass),
            // new RemoveAbstractDefinitionsPass(),
            // new RemoveUnusedDefinitionsPass(),
            // new AnalyzeServiceReferencesPass(),
            // new CheckExceptionOnInvalidReferenceBehaviorPass(),
            // new InlineServiceDefinitionsPass(new AnalyzeServiceReferencesPass()),
            // new AnalyzeServiceReferencesPass(),
            // new DefinitionErrorExceptionPass(),
            ]];
        this.afterRemovingPasses = [[
            // new ResolveHotPathPass(),
            // new ResolveNoPreloadPass(),
            // new AliasDeprecatedPublicServicesPass(),
            ]];
    }
    /**
     * Returns all passes in order to be processed.
     *
     * @return CompilerPassInterface[]
     */
    getPasses() {
        // console.log('MergerPass: ',this.mergePass);
        const passes = [this.mergePass]
            .concat(this.getBeforeOptimizationPasses(), this.getOptimizationPasses(), this.getBeforeRemovingPasses(), this.getRemovingPasses(), this.getAfterRemovingPasses());
        // console.log('final - passes: ', passes);
        return passes;
    }
    /**
     * Adds a pass.
     *
     * @throws InvalidArgumentException when a pass type doesn't exist
     */
    addPass(pass, type = PassHookPoint.BEFORE_OPTIMIZATION, priority = 0) {
        var property = type + 'Passes';
        if (!(property in this)) {
            throw new Error(`Invalid type "${type}".`);
        }
        const passes = this[property];
        if (!passes[priority]) {
            passes[priority] = [];
        }
        passes[priority].push(pass);
    }
    /**
     * Gets all passes for the AfterRemoving pass.
     *
     * @return CompilerPassInterface[]
     */
    getAfterRemovingPasses() {
        // console.log('AFTER_REMOVAL_PASSES: ', this.afterRemovingPasses);
        var result = this.sortPasses(this.afterRemovingPasses);
        // console.log('AFTER_REMOVAL_PASSES:PROCCESSED -> ', result);
        return result;
    }
    /**
     * Gets all passes for the BeforeOptimization pass.
     *
     * @return CompilerPassInterface[]
     */
    getBeforeOptimizationPasses() {
        return this.sortPasses(this.beforeOptimizationPasses);
    }
    /**
     * Gets all passes for the BeforeRemoving pass.
     *
     * @return CompilerPassInterface[]
     */
    getBeforeRemovingPasses() {
        return this.sortPasses(this.beforeRemovingPasses);
    }
    /**
     * Gets all passes for the Optimization pass.
     *
     * @return CompilerPassInterface[]
     */
    getOptimizationPasses() {
        return this.sortPasses(this.optimizationPasses);
    }
    /**
     * Gets all passes for the Removing pass.
     *
     * @return CompilerPassInterface[]
     */
    getRemovingPasses() {
        return this.sortPasses(this.removingPasses);
    }
    /**
     * Gets the Merge pass.
     *
     * @return CompilerPassInterface
     */
    getMergePass() {
        return this.mergePass;
    }
    setMergePass(pass) {
        this.mergePass = pass;
    }
    /**
     * Sets the AfterRemoving passes.
     *
     * @param CompilerPassInterface[] passes
     */
    setAfterRemovingPasses(passes) {
        this.afterRemovingPasses = [passes];
    }
    /**
     * Sets the BeforeOptimization passes.
     *
     * @param CompilerPassInterface[] passes
     */
    setBeforeOptimizationPasses(passes) {
        this.beforeOptimizationPasses = [passes];
    }
    /**
     * Sets the BeforeRemoving passes.
     *
     * @param CompilerPassInterface[] passes
     */
    setBeforeRemovingPasses(passes) {
        this.beforeRemovingPasses = [passes];
    }
    /**
     * Sets the Optimization passes.
     *
     * @param CompilerPassInterface[] passes
     */
    setOptimizationPasses(passes) {
        this.optimizationPasses = [passes];
    }
    /**
     * Sets the Removing passes.
     *
     * @param CompilerPassInterface[] passes
     */
    setRemovingPasses(passes) {
        this.removingPasses = [passes];
    }
    /**
     * Sort passes by priority.
     *
     * @param array passes CompilerPassInterface instances with their priority as key
     *
     * @return CompilerPassInterface[]
     */
    sortPasses(passes) {
        // console.log('passes to sort: ', passes);
        if ((null == passes) || passes.length == 0)
            return [];
        // krsort(passes);
        // Flatten the array
        // return ...passes;
        const _passes = [];
        level_1: for (const i1 in passes) {
            const passList = passes[i1];
            // console.log('index:',i1,'passList: ', passList);
            if (!passList || !Array.isArray(passList))
                continue;
            for (const pass of passList) {
                // console.log(pass);
                _passes.push(pass);
            }
        }
        return _passes;
        return passes.flatMap((entry) => entry);
    }
}
exports.PassConfig = PassConfig;
