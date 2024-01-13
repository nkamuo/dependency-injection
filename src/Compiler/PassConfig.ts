import { CompilerPass } from "./CompilerPass";
import { MergeExtensionConfigurationPass } from "./MergeExtensionConfigurationPass";

export enum PassHookPoint{
   AFTER_REMOVING = 'afterRemoving',
   BEFORE_OPTIMIZATION = 'beforeOptimization',
   BEFORE_REMOVING = 'beforeRemoving',
   OPTIMIZE = 'optimization',
   REMOVE = 'removing',
}

/**
 * Compiler Pass Configuration.
 *
 * This class has a default configuration embedded.
 *
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */
export class PassConfig
{
    // public const TYPE_AFTER_REMOVING = 'afterRemoving';
    // public const TYPE_BEFORE_OPTIMIZATION = 'beforeOptimization';
    // public const TYPE_BEFORE_REMOVING = 'beforeRemoving';
    // public const TYPE_OPTIMIZE = 'optimization';
    // public const TYPE_REMOVE = 'removing';

    private mergePass: CompilerPass;
    private afterRemovingPasses: CompilerPass[][] = [];
    private beforeOptimizationPasses: CompilerPass[][] = [];
    private beforeRemovingPasses: CompilerPass[][] = [];
    private optimizationPasses: CompilerPass[][];
    private removingPasses: CompilerPass[][];

    public  constructor()
    {
        this.mergePass = new MergeExtensionConfigurationPass();

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
    public  getPasses()
    {
        // console.log('MergerPass: ',this.mergePass);

        const passes = [this.mergePass]
                .concat(
                this.getBeforeOptimizationPasses(),
                this.getOptimizationPasses(),
                this.getBeforeRemovingPasses(),
                this.getRemovingPasses(),
                this.getAfterRemovingPasses()
            );

            // console.log('final - passes: ', passes);
            return passes;
    }

    /**
     * Adds a pass.
     *
     * @throws InvalidArgumentException when a pass type doesn't exist
     */
    public  addPass(pass: CompilerPass, type: string = PassHookPoint.BEFORE_OPTIMIZATION, priority = 0)
    {
        var property = type + 'Passes';

        if  (! (property in this)) {
            throw new Error(`Invalid type "${type}".`);
        }

        const passes = (<{[i:string]: any}>this)[property];

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
    public  getAfterRemovingPasses()
    {
        // console.log('AFTER_REMOVAL_PASSES: ', this.afterRemovingPasses);
        var result =  this.sortPasses(this.afterRemovingPasses);
        // console.log('AFTER_REMOVAL_PASSES:PROCCESSED -> ', result);

        return result;
    }

    /**
     * Gets all passes for the BeforeOptimization pass.
     *
     * @return CompilerPassInterface[]
     */
    public  getBeforeOptimizationPasses()
    {
        return this.sortPasses(this.beforeOptimizationPasses);
    }

    /**
     * Gets all passes for the BeforeRemoving pass.
     *
     * @return CompilerPassInterface[]
     */
    public  getBeforeRemovingPasses()
    {
        return this.sortPasses(this.beforeRemovingPasses);
    }

    /**
     * Gets all passes for the Optimization pass.
     *
     * @return CompilerPassInterface[]
     */
    public  getOptimizationPasses()
    {
        return this.sortPasses(this.optimizationPasses);
    }

    /**
     * Gets all passes for the Removing pass.
     *
     * @return CompilerPassInterface[]
     */
    public  getRemovingPasses()
    {
        return this.sortPasses(this.removingPasses);
    }

    /**
     * Gets the Merge pass.
     *
     * @return CompilerPassInterface
     */
    public  getMergePass()
    {
        return this.mergePass;
    }

    public  setMergePass(pass: CompilerPass)
    {
        this.mergePass = pass;
    }

    /**
     * Sets the AfterRemoving passes.
     *
     * @param CompilerPassInterface[] passes
     */
    public  setAfterRemovingPasses(passes: CompilerPass[])
    {
        this.afterRemovingPasses = [passes];
    }

    /**
     * Sets the BeforeOptimization passes.
     *
     * @param CompilerPassInterface[] passes
     */
    public  setBeforeOptimizationPasses(passes: CompilerPass[])
    {
        this.beforeOptimizationPasses = [passes];
    }

    /**
     * Sets the BeforeRemoving passes.
     *
     * @param CompilerPassInterface[] passes
     */
    public  setBeforeRemovingPasses(passes: CompilerPass[])
    {
        this.beforeRemovingPasses = [passes];
    }

    /**
     * Sets the Optimization passes.
     *
     * @param CompilerPassInterface[] passes
     */
    public  setOptimizationPasses(passes: CompilerPass[])
    {
        this.optimizationPasses = [passes];
    }

    /**
     * Sets the Removing passes.
     *
     * @param CompilerPassInterface[] passes
     */
    public  setRemovingPasses(passes: CompilerPass[])
    {
        this.removingPasses = [passes];
    }

    /**
     * Sort passes by priority.
     *
     * @param array passes CompilerPassInterface instances with their priority as key
     *
     * @return CompilerPassInterface[]
     */
    private  sortPasses(passes: CompilerPass[][]): CompilerPass[]
    {
        // console.log('passes to sort: ', passes);
        if((null == passes) || passes.length == 0)
            return [];

        // krsort(passes);

        // Flatten the array
        // return ...passes;
        const _passes: CompilerPass[] = [];
        level_1: for(const i1 in passes){
            const passList = passes[i1];
            // console.log('index:',i1,'passList: ', passList);
            if(!passList || !Array.isArray(passList))
            continue;

            for(const pass of passList){
                // console.log(pass);
                _passes.push(pass);

            }
        }

        return _passes;
        return passes.flatMap( (entry) => entry);
    }
}
