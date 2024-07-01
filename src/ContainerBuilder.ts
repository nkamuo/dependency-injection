// import { entries } from 'core-js/core/array';
import { Alias } from './Alias';
import { AbstractArgument } from './Argument/AbstractArgument';
import { IteratorArgument } from './Argument/IteratorArgument';
import { RewindableGenerator } from './Argument/RewindableGenerator';
import { ServiceClosureArgument } from './Argument/ServiceClosureArgument';
import { ServiceLocatorArgument } from './Argument/ServiceLocatorArgument';
import { ChildDefinition } from './ChildDefinition';
import { Compiler } from './Compiler/Compiler';
import { CompilerPass } from './Compiler/CompilerPass';
// import { MergeExtensionConfigurationPass } from './Compiler/MergeExtensionConfigurationPass';
import { PassHookPoint } from './Compiler/PassConfig';
import { Container, InvalidArgumentException, InvalidServiceBehavior, RuntimeException } from './Container';
import { Definition } from './Definition';
import { Extension } from './Extension/Extension';
import { Parameter } from './Parameter';
import { DefaultParameterBag } from './ParameterBag/DefaultParameterBag';
import { EnvPlaceholderParameterBag } from './ParameterBag/EnvPlaceholderParameterBag';
import { ResolveEnvPlaceholdersPass } from './Compiler/ResolveEnvPlaceholdersPass';
import { ParameterBag } from './ParameterBag/ParameterBag';
import { Reference } from './Reference';
import { TypedReference } from './TypedReference';
import sprintf from 'locutus/php/strings/sprintf';

class ServiceNotFoundException extends Error{
    constructor(id: string){
        super(sprintf("Service with id or alias \"%s\" was not found",id));
    }
}
class ServiceCircularReferenceException extends Error{
    constructor(message: string, seen: any[]){
        super(message);
    }
}

export class ContainerBuilder extends Container// implements TaggedContainerInterface
{
    /**
     * @var array<string, ExtensionInterface>
     */
    private extensions: {[i:string]: Extension} = {};

    /**
     * @var array<string, ExtensionInterface>
     */
    private extensionsByNs: {[i:string]: any} = {};

    /**
     * @var array<string, Definition>
     */
    private definitions: {[i:string]: Definition} = {};

    /**
     * @var array<string, Alias>
     */
    private aliasDefinitions: {[i:string]: Alias} = {};

    /**
     * @var array<string, ResourceInterface>
     */
    private resources: {[i:string]: any} = {};

    /**
     * @var array<string, array<array<string, mixed>>>
     */
    private extensionConfigs: {[i:string]: {[i:string]: any}[]} = {};

    /**
     * @var Compiler
     */
    private compiler!: Compiler;

    /**
     * @var bool
     */
    private trackResources: any;

    /**
     * @var InstantiatorInterface|null
     */
    private proxyInstantiator: any;

    /**
     * @var ExpressionLanguage|null
     */
    // private expressionLanguage;

    /**
     * @var ExpressionFunctionProviderInterface[]
     */
    private expressionLanguageProviders: {[i:string]: any} = {};

    /**
     * @var string[] with tag names used by findTaggedServiceIds
     */
    private usedTags: string[] = [];

    /**
     * @var string[][] a map of env var names to their placeholders
     */
    private envPlaceholders: {[i:string]: any} = {};

    /**
     * @var int[] a map of env vars to their resolution counter
     */
    private envCounters: {[i:string]: any} = {};

    /**
     * @var string[] the list of vendor directories
     */
    // private vendors;

    /**
     * @var array<string, ChildDefinition>
     */
    private autoconfiguredInstanceof: {[i:string]: any} = {};

    /**
     * @var array<string, callable>
     */
    private autoconfiguredAttributes: {[i:string]: any} = {};

    /**
     * @var array<string, bool>
     */
    private removedIds: {[i: string]: boolean} = {};

    /**
     * @var array<int, boolean>
     */
    private removedBindingIds: boolean[] = [];

    private static readonly INTERNAL_TYPES = {
        'int' : true,
        'float' : true,
        'string' : true,
        'bool' : true,
        'resource' : true,
        'object' : true,
        'array' : true,
        'null' : true,
        'callable' : true,
        'iterable' : true,
        'mixed' : true,
    };

    public  constructor(parameterBag: ParameterBag<any> = <ParameterBag<any>><any>null)
    {
        super(parameterBag);

        const deprecationMessage = "Depication %alias_id% Message";
        // this.trackResources = interface_exists(ResourceInterface::class);

        this.setDefinition('service_container', (new Definition(Container)).setSynthetic(true).setPublic(true));
        // this.setAlias(PsrContainerInterface::class, new Alias('service_container', false)).setDeprecated('symfony/dependency-injection', '5.1', deprecationMessage = 'The "%alias_id%" autowiring alias is deprecated. Define it explicitly in your app if you want to keep using it.');
        this.setAlias(Container.name, new Alias('service_container', false)).setDeprecated('symfony/dependency-injection', '5.1', deprecationMessage);
    }

    /**
     * @var array<string, \ReflectionClass>
     */
    private classReflectors: any;

    /**
     * Sets the track resources flag.
     *
     * If you are not using the loaders and therefore don't want
     * to depend on the Config component, set this flag to false.
     */
    public  setResourceTracking(track: boolean)
    {
        this.trackResources = track;
    }

    /**
     * Checks if resources are tracked.
     *
     * @return bool
     */
    public  isTrackingResources()
    {
        return this.trackResources;
    }

    // /**
    //  * Sets the instantiator to be used when fetching proxies.
    //  */
    // public  setProxyInstantiator(InstantiatorInterface proxyInstantiator)
    // {
    //     this.proxyInstantiator = proxyInstantiator;
    // }

    public  registerExtension(extension: Extension)
    {
        if(extension.getAlias() in this.extensions)
            throw new Error(`Registering Extension with the alias "${extension.getAlias()} more than"`);


        this.extensions[extension.getAlias()] = extension;

        if (false !== extension.getNamespace()) {
            this.extensionsByNs[<string>extension.getNamespace()] = extension;
        }
    }

    /**
     * Returns an extension by alias or namespace.
     *
     * @return Extension
     *
     * @throws LogicException if the extension is not registered
     */
    public  getExtension(name: string)
    {
        if ((name in this.extensions)) {
            return this.extensions[name];
        }

        if ((name in this.extensionsByNs[name])) {
            return this.extensionsByNs[name];
        }

        throw new RuntimeException((`Container extension "${name}" is not registered.`));
    }

    /**
     * Returns all registered extensions.
     *
     * @return array<string, Extension>
     */
    public  getExtensions()
    {
        return this.extensions;
    }

    /**
     * Checks if we have an extension.
     *
     * @return bool
     */
    public  hasExtension(name: string)
    {
        return (name in this.extensions) || (name in this.extensionsByNs);
    }

    // /**
    //  * Returns an array of resources loaded to build this configuration.
    //  *
    //  * @return ResourceInterface[]
    //  */
    // public  getResources()
    // {
    //     return array_values(this.resources);
    // }

    // /**
    //  * @return this
    //  */
    // public  addResource(ResourceInterface resource)
    // {
    //     if (!this.trackResources) {
    //         return this;
    //     }

    //     if (resource instanceof GlobResource && this.inVendors(resource.getPrefix())) {
    //         return this;
    //     }

    //     this.resources[(string) resource] = resource;

    //     return this;
    // }

    // /**
    //  * Sets the resources for this configuration.
    //  *
    //  * @param array<string, ResourceInterface> resources
    //  *
    //  * @return this
    //  */
    // public  setResources(array resources)
    // {
    //     if (!this.trackResources) {
    //         return this;
    //     }

    //     this.resources = resources;

    //     return this;
    // }

    // /**
    //  * Adds the object class hierarchy as resources.
    //  *
    //  * @param object|string object An object instance or class name
    //  *
    //  * @return this
    //  */
    public  addObjectResource(resource: object)
    {
        // if (this.trackResources) {
        //     if (typeof(resource) === 'obejct') {
        //         resource = (resource);
        //     }
        //     if (!isset(this.classReflectors[object])) {
        //         this.classReflectors[object] = new \ReflectionClass(object);
        //     }
        //     class = this.classReflectors[object];

        //     foreach (class.getInterfaceNames() as name) {
        //         if (null === interface = &this.classReflectors[name]) {
        //             interface = new \ReflectionClass(name);
        //         }
        //         file = interface.getFileName();
        //         if (false !== file && file_exists(file)) {
        //             this.fileExists(file);
        //         }
        //     }
        //     do {
        //         file = class.getFileName();
        //         if (false !== file && file_exists(file)) {
        //             this.fileExists(file);
        //         }
        //         foreach (class.getTraitNames() as name) {
        //             this.addObjectResource(name);
        //         }
        //     } while (class = class.getParentClass());
        // }

        return this;
    }

    /**
     * Retrieves the requested reflection class and registers it for resource tracking.
     *
     * @throws \ReflectionException when a parent class/interface/trait is not found and throw is true
     *
     * @final
     */
    public  getReflectionClass(serviceClass?: Function|string, _throw = true)//: ?ReflectionClass
    {
        if (!(serviceClass = this.getParameterBag().resolveValue(serviceClass))) {
            return null;
        }

        if ((<string>serviceClass) in ContainerBuilder.INTERNAL_TYPES) {
            return null;
        }

        throw new RuntimeException("ReflectionClass not Supported");

        // resource = classReflector = null;

        // try {
        //     if (isset(this.classReflectors[class])) {
        //         classReflector = this.classReflectors[class];
        //     } elseif (class_exists(ClassExistenceResource::class)) {
        //         resource = new ClassExistenceResource(class, false);
        //         classReflector = resource.isFresh(0) ? false : new \ReflectionClass(class);
        //     } else {
        //         classReflector = class_exists(class) ? new \ReflectionClass(class) : false;
        //     }
        // } catch (\ReflectionException e) {
        //     if (throw) {
        //         throw e;
        //     }
        // }

        // if (this.trackResources) {
        //     if (!classReflector) {
        //         this.addResource(resource ?? new ClassExistenceResource(class, false));
        //     } elseif (!classReflector.isInternal()) {
        //         path = classReflector.getFileName();

        //         if (!this.inVendors(path)) {
        //             this.addResource(new ReflectionClassResource(classReflector, this.vendors));
        //         }
        //     }
        //     this.classReflectors[class] = classReflector;
        // }

        // return classReflector ?: null;
    }

    // /**
    //  * Checks whether the requested file or directory exists and registers the result for resource tracking.
    //  *
    //  * @param string      path          The file or directory path for which to check the existence
    //  * @param bool|string trackContents Whether to track contents of the given resource. If a string is passed,
    //  *                                   it will be used as pattern for tracking contents of the requested directory
    //  *
    //  * @final
    //  */
    // public  fileExists(string path, trackContents = true): bool
    // {
    //     exists = file_exists(path);

    //     if (!this.trackResources || this.inVendors(path)) {
    //         return exists;
    //     }

    //     if (!exists) {
    //         this.addResource(new FileExistenceResource(path));

    //         return exists;
    //     }

    //     if (is_dir(path)) {
    //         if (trackContents) {
    //             this.addResource(new DirectoryResource(path, \is_string(trackContents) ? trackContents : null));
    //         } else {
    //             this.addResource(new GlobResource(path, '/*', false));
    //         }
    //     } elseif (trackContents) {
    //         this.addResource(new FileResource(path));
    //     }

    //     return exists;
    // }

    /**
     * Loads the configuration for an extension.
     *
     * @param string                    extension The extension alias or namespace
     * @param array<string, mixed>|null values    An array of values that customizes the extension
     *
     * @return this
     *
     * @throws BadMethodCallException When this ContainerBuilder is compiled
     * @throws \LogicException        if the extension is not registered
     */
    public  loadFromExtension(extension: string, values?: any[])
    {
        if (this.isCompiled()) {
            throw new RuntimeException('BadMethodCallException: Cannot load from an extension on a compiled container.');
        }

        var namespace = this.getExtension(extension).getAlias();

        this.extensionConfigs[namespace].push(values ?? []);
        // this.extensionConfigs[namespace].push()


        return this;
    }

    /**
     * Adds a compiler pass.
     *
     * @param string type     The type of compiler pass
     * @param int    priority Used to sort the passes
     *
     * @return this
     */
    public  addCompilerPass(pass: CompilerPass, type = PassHookPoint.BEFORE_OPTIMIZATION, priority = 0): ContainerBuilder
    {
        this.getCompiler().addPass(pass, type, priority);

        // this.addObjectResource(pass);

        return this;
    }

    /**
     * Returns the compiler pass config which can then be modified.
     *
     * @return PassConfig
     */
    public  getCompilerPassConfig()
    {
        return this.getCompiler().getPassConfig();
    }

    /**
     * Returns the compiler.
     *
     * @return Compiler
     */
    public  getCompiler()
    {
        if (null == this.compiler) {
            this.compiler = new Compiler();
        }

        return this.compiler;
    }

    /**
     * Sets a service.
     *
     * @throws BadMethodCallException When this ContainerBuilder is compiled
     */
    public  set(id: string,service?: object)
    {
        if (this.isCompiled() && (id in (this.definitions) && !this.definitions[id].isSynthetic())) {
            // setting a synthetic service on a compiled container is alright
            throw new RuntimeException(`BadMethodCallException: Setting service "${id}" for an unknown or non-synthetic service definition on a compiled container is not allowed.`);
        }

        delete this.definitions[id], this.aliasDefinitions[id], (<any>this).removedIds[id];

        super.set(id, service as object);
    }

    /**
     * Removes a service definition.
     */
    public  removeDefinition(id: string)
    {
        if ((id in this.definitions)) {
            delete (this.definitions[id]);
            (<any>this).removedIds[id] = true;
        }
    }

    /**
     * Returns true if the given service is defined.
     *
     * @param string id The service identifier
     *
     * @return bool
     */
    public  has(id: string)
    {
        return (id in this.definitions) || (id in this.aliasDefinitions) || super.has(id);
    }

    /**
     * @return object|null
     *
     * @throws InvalidArgumentException          when no definitions are available
     * @throws ServiceCircularReferenceException When a circular reference is detected
     * @throws ServiceNotFoundException          When the service is not defined
     * @throws \Exception
     *
     * @see Reference
     */
    public  get<T = any>(id: string, invalidBehavior = InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE): T
    {

        if (this.isCompiled() && (id in this.removedIds) /* ContainerInterface::EXCEPTION_ON_INVALID_REFERENCE >= invalidBehavior */) {
            return super.get(id);
        }

        return this.doGet(id, invalidBehavior);
    }



    private doGet<T = any>(id: string, invalidBehavior = InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE, inlineServices: {[i: string]: any} = {},isConstructorArgument = false): T
    {
        var definition: Definition;
        var service: any;

        if ((inlineServices !== null && id in inlineServices)) {
            return inlineServices[id];
        }
        if (null === inlineServices) {
            isConstructorArgument = true;
            inlineServices = [];
        }
        try {
            if (InvalidServiceBehavior.IGNORE_ON_UNINITIALIZED_REFERENCE === invalidBehavior) {
                return super.get(id, invalidBehavior);
            }
            if (service = super.get(id, InvalidServiceBehavior.NULL_ON_INVALID_REFERENCE)) {
                return service;
            }
        } catch ( e) {
            //ServiceCircularReferenceException
            if (isConstructorArgument) {
                throw e;
            }
        }

        if (!(id in this.definitions) && (id in this.aliasDefinitions)) {
            const alias = this.aliasDefinitions[id];

            if (alias.isDeprecated()) {
                const deprecation = alias.getDeprecation(id);
                console.warn(deprecation['package'], deprecation['version'], deprecation['message']);
            }

            return this.doGet(alias.toString(), invalidBehavior, inlineServices, isConstructorArgument);
        }

        try {
            definition = this.getDefinition(id);
        } catch (e) {
            //ServiceNotFoundException
            // if (InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE.valueOf() < invalidBehavior.valueOf()) {
            //     return null;
            // }

            throw e;
        }

        var errors;
        if (definition.hasErrors() && (errors = definition.getErrors()).length > 0 ) {
            throw new RuntimeException((errors.toString()));
        }

        if (isConstructorArgument) {
            this.loading[id] = true;
        }

        try {
            return this.createService(definition, inlineServices, isConstructorArgument, id);
        } finally {
            if (isConstructorArgument) {
                delete (this.loading[id]);
            }
        }
    }

    /**
     * Merges a ContainerBuilder with the current ContainerBuilder configuration.
     *
     * Service definitions overrides the current defined ones.
     *
     * But for parameters, they are overridden by the current ones. It allows
     * the parameters passed to the container constructor to have precedence
     * over the loaded ones.
     *
     *     container = new ContainerBuilder(new ParameterBag(['foo' : 'bar']));
     *     loader = new LoaderXXX(container);
     *     loader.load('resource_name');
     *     container.register('foo', 'stdClass');
     *
     * In the above example, even if the loaded resource defines a foo
     * parameter, the value will still be 'bar' as defined in the ContainerBuilder
     * constructor.
     *
     * @throws BadMethodCallException When this ContainerBuilder is compiled
     */
    public  merge(container: ContainerBuilder)
    {
        if (this.isCompiled()) {
            throw new RuntimeException('BadMethodCallException: Cannot merge on a compiled container.');
        }

        this.addDefinitions(container.getDefinitions());
        this.addAliases(container.getAliases());
        this.getParameterBag().add(container.getParameterBag().all());

        if (this.trackResources) {
            throw new RuntimeException("Resources are not Supported")
            // for(const resource of container.getResources()) {
                // this.addResource(resource);
            // }
        }

        for(const name in this.extensions) {
            const extension = this.extensions[name];

            if (!(name in this.extensionConfigs)) {
                this.extensionConfigs[name] = [];
            }

            this.extensionConfigs[name] = [...this.extensionConfigs[name], ...container.getExtensionConfig(name)];
        }
        var envPlaceholders: any;
        var bag: ParameterBag<any>;

        if ((bag = this.getParameterBag()) instanceof EnvPlaceholderParameterBag && container.getParameterBag() instanceof EnvPlaceholderParameterBag) {
            
            // throw new RuntimeException("EnV Parameter Bags are not Supported")

            const containerBag = <EnvPlaceholderParameterBag<any>> bag;
            
            envPlaceholders = containerBag.getEnvPlaceholders();
            bag.mergeEnvPlaceholders(containerBag);
        } else {
            envPlaceholders = {};
        }

        for(const env in container.envCounters) {
            const count = this.envCounters[env];

            if (!count && !(env in envPlaceholders)) {
                continue;
            }
            if (!(env in this.envCounters)) {
                this.envCounters[env] = count;
            } else {
                this.envCounters[env] += count;
            }
        }

        var enteries = container.getAutoconfiguredInstanceof();
        for(const _interface in enteries) {
            
            const childDefinition = enteries[_interface];

            if ((_interface in this.autoconfiguredInstanceof)) {
                throw new InvalidArgumentException(`"${_interface}" has already been autoconfigured and merge() does not support merging autoconfiguration for the same class/interface.`);
            }

            this.autoconfiguredInstanceof[_interface] = childDefinition;
        }

        var enteries = container.getAutoconfiguredAttributes();

        for(const attribute in enteries) {

            const configurator = enteries[attribute];

            if ((attribute in this.autoconfiguredAttributes)) {
                throw new InvalidArgumentException(`"${attribute}" has already been autoconfigured and merge() does not support merging autoconfiguration for the same attribute.`);
            }

            this.autoconfiguredAttributes[attribute] = configurator;
        }
    }

    /**
     * Returns the configuration array for the given extension.
     *
     * @return array<array<string, mixed>>
     */
    public  getExtensionConfig(name: string)
    {
        if (!(name in this.extensionConfigs)) {
            this.extensionConfigs[name] = [];
        }

        return this.extensionConfigs[name];
    }

    /**
     * Prepends a config array to the configs of the given extension.
     *
     * @param array<string, mixed> config
     */
    public  prependExtensionConfig(name: string, config: {[i:string]: any})
    {
        if (!(name in this.extensionConfigs)) {
            this.extensionConfigs[name] = [];
        }

        this.extensionConfigs[name].unshift(config);
    }

    /**
     * Compiles the container.
     *
     * This method passes the container to compiler
     * passes whose job is to manipulate and optimize
     * the container.
     *
     * The main compiler passes roughly do four things:
     *
     *  * The extension configurations are merged;
     *  * Parameter values are resolved;
     *  * The parameter bag is frozen;
     *  * Extension loading is disabled.
     *
     * @param bool resolveEnvPlaceholders Whether %env()% parameters should be resolved using the current
     *                                     env vars or be replaced by uniquely identifiable placeholders.
     *                                     Set to "true" when you want to use the current ContainerBuilder
     *                                     directly, keep to "false" when the container is dumped instead.
     */
    public  compile(resolveEnvPlaceholders = true)
    {
        var compiler = this.getCompiler();

        if (this.trackResources) {
            for (const pass of compiler.getPassConfig().getPasses()) {
                // this.addObjectResource(pass);
            }
        }
        const bag = this.getParameterBag();


        if (resolveEnvPlaceholders && bag instanceof EnvPlaceholderParameterBag) {
            // console.log('added ResolveEnvPlaceholdersPass: ', ResolveEnvPlaceholdersPass);
            compiler.addPass(new ResolveEnvPlaceholdersPass(), PassHookPoint.AFTER_REMOVING, -1000);
        }

        compiler.compile(this);

        for(const id in this.definitions) {
            const definition = this.definitions[id];

            if (this.trackResources && definition.isLazy()) {
                this.getReflectionClass(definition.getClass());
            }
        }

        this.extensionConfigs = {};

        if (bag instanceof EnvPlaceholderParameterBag) {
            if (resolveEnvPlaceholders) {
                this.parameterBag = new DefaultParameterBag(this.resolveEnvPlaceholders(bag.all(), true));
            }

            // this.envPlaceholders = bag.getEnvPlaceholders();
        }

        super.compile();

        var defs= {...this.definitions,...this.aliasDefinitions};

        // console.log('defs-all: ', defs);

        for(const id in defs) {
            const definition = this.definitions[id];


            if(!(definition instanceof Definition))
                continue;

            // console.log('def: ', definition);

            if (!definition.isPublic() || definition.isPrivate()) {
                this.removedIds[id] = true;
            }
        }
    }

    /**
     * {@inheritdoc}
     */
    public  getServiceIds()
    {
        
        var servicesIds = ['service_container']
                                .concat(...Object.keys(this.getDefinitions()))
                                .concat(...Object.keys(this.aliasDefinitions))
                                .concat((super.getServiceIds()))
                                ;
        servicesIds = [... new Set(servicesIds)];

        return servicesIds.map( servicesId => String(servicesId));
     }

    /**
     * Gets removed service or alias ids.
     *
     * @return array<string, bool>
     */
    public  getRemovedIds()
    {
        return this.removedIds;
    }

    /**
     * Adds the service aliases.
     *
     * @param array<string, string|Alias> aliases
     */
    public  addAliases(aliases: {[i:string]: string|Alias})
    {
        for(const alias in aliases) {
            const id = aliases[alias];

            this.setAlias(alias, id);
        }
    }

    /**
     * Sets the service aliases.
     *
     * @param array<string, string|Alias> aliases
     */
    public  setAliases(aliases: {[i:string]: string|Alias})
    {
        this.aliasDefinitions = {};
        this.addAliases(aliases);
    }

    /**
     * Sets an alias for an existing service.
     *
     * @param string       alias The alias to create
     * @param string|Alias id    The service to alias
     *
     * @return Alias
     *
     * @throws InvalidArgumentException if the id is not a string or an Alias
     * @throws InvalidArgumentException if the alias is for itself
     */
    public  setAlias(alias: string, id: string|Alias)
    {
        // if ('' === alias || '\\' === alias[-1] || \strlen(alias) !== strcspn(alias, "\0\r\n'")) {
        //     throw new InvalidArgumentException(sprintf('Invalid alias id: "%s".', alias));
        // }

        if ((typeof id === 'string')) {
            id = new Alias(id);
        } else
        if (!(id instanceof Alias)) {
            throw new InvalidArgumentException('id must be a string, or an Alias object.');
        }

        if (alias ===  String(id)) {
            throw new InvalidArgumentException(`An alias cannot reference itself, got a circular reference on "${alias}".`);
        }

        delete this.definitions[alias], this.removedIds[alias];

        return this.aliasDefinitions[alias] = id;
    }


    public  removeAlias(alias: string)
    {
        if (alias in this.aliasDefinitions) {
            delete(this.aliasDefinitions[alias]);
            this.removedIds[alias] = true;
        }
    }

    /**
     * @return bool
     */
    public  hasAlias(id: string)
    {
        return (id in this.aliasDefinitions);
    }

    /**
     * @return array<string, Alias>
     */
    public  getAliases()
    {
        return this.aliasDefinitions;
    }

    /**
     * @return Alias
     *
     * @throws InvalidArgumentException if the alias does not exist
     */
    public  getAlias(id: string)
    {
        if (!(id in this.aliasDefinitions)) {
            throw new InvalidArgumentException((`The service alias "${id}" does not exist.`));
        }

        return this.aliasDefinitions[id];
    }

    /**
     * Registers a service definition.
     *
     * This methods allows for simple registration of service definition
     * with a fluid interface.
     *
     * @return Definition
     */
    public  register<T>(id: string, serviceClass?: any)
    {
        return this.setDefinition(id, new Definition(serviceClass));
    }

    /**
     * Registers an autowired service definition.
     *
     * This method implements a shortcut for using setDefinition() with
     * an autowired definition.
     *
     * @return Definition
     */
    public  autowire(id: string, serviceClass?: any)
    {
        return this.setDefinition(id, (new Definition(serviceClass)).setAutowired(true));
    }

    /**
     * Adds the service definitions.
     *
     * @param array<string, Definition> definitions
     */
    public  addDefinitions(definitions: {[i:string]: Definition})
    {
        for(const id in definitions) {
            const definition = definitions[id];
            this.setDefinition(id, definition);
        }
    }

    /**
     * Sets the service definitions.
     *
     * @param array<string, Definition> definitions
     */
    public  setDefinitions(definitions:  {[i:string]: Definition})
    {
        this.definitions = {};
        this.addDefinitions(definitions);
    }

    /**
     * Gets all service definitions.
     *
     * @return array<string, Definition>
     */
    public  getDefinitions()
    {
        return this.definitions;
    }

    /**
     * Sets a service definition.
     *
     * @return Definition
     *
     * @throws BadMethodCallException When this ContainerBuilder is compiled
     */
    public  setDefinition(id: string, definition: Definition)
    {
        if (this.isCompiled()) {
            throw new RuntimeException('BadMethodCallException: Adding definition to a compiled container is not allowed.');
        }

        // if ('' === id || '\\' === id[-1] || \strlen(id) !== strcspn(id, "\0\r\n'")) {
        //     throw new InvalidArgumentException(sprintf('Invalid service id: "%s".', id));
        // }

        delete this.aliasDefinitions[id], this.removedIds[id];

        return this.definitions[id] = definition;
    }

    /**
     * Returns true if a service definition exists under the given identifier.
     *
     * @return bool
     */
    public  hasDefinition(id: string)
    {
        return (id in this.definitions);
    }

    /**
     * Gets a service definition.
     *
     * @return Definition
     *
     * @throws ServiceNotFoundException if the service definition does not exist
     */
    public  getDefinition(id: string)
    {
        if (!(id in this.definitions)) {
            throw new ServiceNotFoundException(id);
        }

        return this.definitions[id];
    }

    /**
     * Gets a service definition by id or alias.
     *
     * The method "unaliases" recursively to return a Definition instance.
     *
     * @return Definition
     *
     * @throws ServiceNotFoundException if the service definition does not exist
     */
    public  findDefinition(id: string)
    {
        const seen:{[i:string]: any} = {};
        while ((id in this.aliasDefinitions)) {
            id = String(this.aliasDefinitions[id]);

            if ((id in seen)) {
                var seenArr = Object.values(seen);
                seenArr = seenArr.slice(seenArr.indexOf(id));
                // seen = {...seenArr ,id};

                seenArr.push(id);

                throw new ServiceCircularReferenceException(id, seenArr);
            }

            seen[id] = id;
        }

        return this.getDefinition(id);
    }

    /**
     * Creates a service for a service definition.
     *
     * @return mixed
     *
     * @throws RuntimeException         When the factory definition is incomplete
     * @throws RuntimeException         When the service is a synthetic service
     * @throws InvalidArgumentException When configure callable is not callable
     * @important
     */
    private  createService(
                definition: Definition,
                inlineServices: {[i:string]: any},
                isConstructorArgument = false,
                id: string = null as any,
                tryProxy = true)
    {

        var factory: any;
        var service: any;
        var proxy: any;
        // if (null === id && isset(inlineServices[h = spl_object_hash(definition)])) {
        //     return inlineServices[h];
        // }

        // if (definition instanceof ChildDefinition) {
        //     throw new RuntimeException(sprintf('Constructing service "%s" from a parent definition is not supported at build time.', id));
        // }

        if (definition.isSynthetic()) {
            throw new RuntimeException(`You have requested a synthetic service ("id"). The DIC does not know how to construct this service.`);
        }

        if (definition.isDeprecated()) {
            const deprecation = definition.getDeprecation(id);
            console.warn(deprecation['package'], deprecation['version'], deprecation['message']);
        }

        if (tryProxy && definition.isLazy() && !(tryProxy = !(proxy = this.proxyInstantiator)) /*|| proxy instanceof RealServiceInstantiator*/) {
           throw new RuntimeException("Ended up in a service proxy while creating");
            // proxy = proxy.instantiateProxy(
            //     this,
            //     definition,
            //     id,  () use (definition, &inlineServices, id) {
            //         return this.createService(definition, inlineServices, true, id, false);
            //     }
            // );
            // this.shareService(definition, proxy, id, inlineServices);

            // return proxy;
        }


        const parameterBag = this.getParameterBag();

        if (null !== definition.getFile()) {
            // require_once parameterBag.resolveValue(definition.getFile());
            //awiat requireJS(definition.getFile()).
        }

        // console.log('DEFINITION ARGS: ');
        // console.log(definition.getArguments());

        var args = this.doResolveServices(parameterBag.unescapeValue(parameterBag.resolveValue(definition.getArguments())), inlineServices, isConstructorArgument);

        if (null !== (factory = definition.getFactory()) && undefined !== factory) {
            if (Array.isArray(factory)) {

                //PAY MORE ATTENSION HERE

                factory = [this.doResolveServices(parameterBag.resolveValue(factory[0]), inlineServices, isConstructorArgument), factory[1]];
            
            }
            // else
            // if ((typeof factory !== 'string')) {
            //     // console.log(factory);

            //     throw new RuntimeException(`Cannot create service "${id}" because of invalid factory.`);
            // }
        }

        if (null !== id && definition.isShared() && (id in this.services) && (tryProxy || !definition.isLazy())) {
            return this.services[id];
        }

        if (null !== factory && undefined !== factory ) {
            // console.log('args: ', {...Object.assign({},args)});
            // console.log('base-args: ', definition.getArguments());

            if(Array.isArray(args))
                service = factory(...args);
            else{
                args = Object.assign({},args);
                service = factory(args);
            }

            if (!definition.isDeprecated() && Array.isArray(factory) && (typeof factory[0] == 'string')) {
                // r = new \ReflectionClass(factory[0]);

                // if (0 < strpos(r.getDocComment(), "\n * @deprecated ")) {
                //     trigger_deprecation('', '', 'The "%s" service relies on the deprecated "%s" factory class. It should either be deprecated or its factory upgraded.', id, r.name);
                // }
            }
        } else {

            // console.log('args: ', args);

            service = Reflect.construct(<Function>definition.getClass(),args);

            //Create a NEW INSTNACE HERE

            // r = new \ReflectionClass(parameterBag.resolveValue(definition.getClass()));

            // service = null === r.getConstructor() ? r.newInstance() : r.newInstanceArgs(array_values(args));

            // if (!definition.isDeprecated() && 0 < strpos(r.getDocComment(), "\n * @deprecated ")) {
            //     trigger_deprecation('', '', 'The "%s" service relies on the deprecated "%s" class. It should either be deprecated or its implementation upgraded.', id, r.name);
            // }
        }

        var lastWitherIndex: number|string = null as any;
        var methodsCalls = definition.getMethodCalls();

        for( const k in methodsCalls) {
            const call = methodsCalls[k];
            if (call[2] ?? false) {
                lastWitherIndex = k;
            }
        }

        if (null === lastWitherIndex && (tryProxy || !definition.isLazy())) {
            // share only if proxying failed, or if not a proxy, and if no withers are found
            this.shareService(definition, service, id, inlineServices);
        }

        const properties = this.doResolveServices(parameterBag.unescapeValue(parameterBag.resolveValue(definition.getProperties())), inlineServices);
        
        for(const name in properties) {
            const value = properties[name];
            service[name] = value;
        }

        methodsCalls = definition.getMethodCalls();

        for( const k in methodsCalls) {
            const call = methodsCalls[k];
            service = this.callMethod(service, call, inlineServices);

            if (lastWitherIndex === k && (tryProxy || !definition.isLazy())) {
                // share only if proxying failed, or if not a proxy, and this is the last wither
                this.shareService(definition, service, id, inlineServices);
            }
        }

        var callable;

        if (callable = definition.getConfigurator()) {
            if (Array.isArray(callable)) {
                callable[0] = parameterBag.resolveValue(callable[0]);

                if (callable[0] instanceof Reference) {
                    callable[0] = this.doGet( String(callable[0]), callable[0].getInvalidBehavior(), inlineServices);
                }
                else
                if (callable[0] instanceof Definition) {
                    callable[0] = this.createService(callable[0], inlineServices);
                }
            }

            if (!(typeof callable == 'function')) {
                throw new InvalidArgumentException(`The configure callable for class "${service}" is not a callable.`);
            }

            callable(service);
        }

        return service;
    }

    /**
     * Replaces service references by the real service instance and evaluates expressions.
     *
     * @param mixed value
     *
     * @return mixed The same value with all service references replaced by
     *               the real service instances and all expressions evaluated
     */
    public  resolveServices(value: any)
    {
        return this.doResolveServices(value);
    }

    private  doResolveServices(value: any, inlineServices:{[i:string]: any} = {}, isConstructorArgument = false)
    {
        // console.log('params: ', value);
        
        const self = this;
        var reference: Reference;

        if (value && (typeof value == 'object' && (value.constructor === Object || value instanceof Array))) {
            // console.log('values: ', value);
            // return value;
            var result: any = Array.isArray(value)? [] : {};
            for(const k in value) {
                const v = value[k];
                value[k] = this.doResolveServices(v, inlineServices, isConstructorArgument);
            }
        }
        else
        if (value instanceof ServiceClosureArgument) {
            reference = value.getValues()[0];
            const self = this;
            var _value: ServiceClosureArgument = value;
            // value =  function(reference: Reference){
            //     return self.resolveServices(reference);
            // };

            // return (reference: Reference) => self.resolveServices(reference) 

            

            value = (...args: any[]) => {
                const service = self.resolveServices(reference);
                const methodName = _value.getMethod();

                if(methodName){

                if(!service[methodName] || !(('apply' in service[methodName]) || 'call' in service[methodName]))
                    throw new TypeError(`Property "${methodName}" of service "${reference.getId()}", is not a valid callable`);

                    return service[methodName](...args);
                    // return service[methodName].call(service,...args);
                }


                if(!(('apply' in service) || 'call' in service))
                    throw new TypeError(`Service ${reference.getId()} used as a callable service is not callable`);

                return service(...args);
            }
        }
        else
        if (value instanceof IteratorArgument) {
            value = new RewindableGenerator( function*(){
                var values = value.getValues();
                level_1: for( const k in values) {
                    const v = values[k];

                    for(const s of ContainerBuilder.getServiceConditionals(v)) {
                        if (!self.has(s)) {
                            continue level_1;
                        }
                    }
                    for(const s of ContainerBuilder.getInitializedConditionals(v)) {
                        if (!self.doGet(s, InvalidServiceBehavior.IGNORE_ON_UNINITIALIZED_REFERENCE, inlineServices)) {
                            continue level_1;
                        }
                    }

                    yield {k : self.doResolveServices(v, inlineServices)};
                    // yield k => this.doResolveServices(v, inlineServices);
                }
            },  function(value: any): number {
                var count = 0;
                var values = value.getValues();
                level_1: for( const k in values) {
                    const v = values[k];

                    for(const s of ContainerBuilder.getServiceConditionals(v)) {
                        if (!self.has(s)) {
                            continue level_1;
                        }
                    }
                    for(const s of ContainerBuilder.getInitializedConditionals(v)) {
                        if (!self.doGet(s, InvalidServiceBehavior.IGNORE_ON_UNINITIALIZED_REFERENCE)) {
                            continue level_1;
                        }
                    }

                    ++count;
                }

                return count;
            });
        } 
        else
        if (value instanceof ServiceLocatorArgument) {
            var refs: {[i:string]: any} = [] ,types: any[] = [];
            
            var values = value.getValues();
            for( const k in values) {
                const v = values[k];

                if (v) {
                    refs[k] = [v];
                    types[k] =( v instanceof TypedReference)? v.getType() : '?';
                }
            }
            // value = new ServiceLocator(\Closure::fromCallable([this, 'resolveServices']), refs, types);
            throw new RuntimeException("Not Class: ServiceLocator");
        }
        else
        if (value instanceof Reference) {
            value = this.doGet(String(value), value.getInvalidBehavior(), inlineServices, isConstructorArgument);
        }
        else
        if (value instanceof Definition) {
            value = this.createService(value, inlineServices, isConstructorArgument);
        }
        else
        if (value instanceof Parameter) {
            value = this.getParameter( String(value));
        }
        // else
        // if (value instanceof Expression) {
        //     value = this.getExpressionLanguage().evaluate(value, ['container' : this]);
        // }
        else
        if (value instanceof AbstractArgument) {
            throw new RuntimeException(value.getTextWithContext());
        }

        return value;
    }

    /**
     * Returns service ids for a given tag.
     *
     * Example:
     *
     *     container.register('foo').addTag('my.tag', ['hello' : 'world']);
     *
     *     serviceIds = container.findTaggedServiceIds('my.tag');
     *     foreach (serviceIds as serviceId : tags) {
     *         foreach (tags as tag) {
     *             echo tag['hello'];
     *         }
     *     }
     *
     * @return array<string, array> An array of tags with the tagged service as key, holding a list of attribute arrays
     */
    public  findTaggedServiceIds(name: string, throwOnAbstract = false)
    {
        this.usedTags.push(name);
        const tags: {[i:string]: any} = [];

        const definitions = this.getDefinitions();
        for(const id in definitions) {
            const definition = definitions[id];

            if (definition.hasTag(name)) {
                if (throwOnAbstract && definition.isAbstract()) {
                    throw new InvalidArgumentException(`The service "%s" tagged "%s" must not be abstract.`);
                }
                tags[id] = definition.getTag(name);
            }
        }

        return tags;
    }

    /**
     * Returns all tags the defined services use.
     *
     * @return string[]
     */
    public  findTags()
    {
        const tags: any[] = [];
        const definitions = this.getDefinitions();
        for(const id in definitions) {
            const definition = definitions[id];

            tags.push(...Array.from(Reflect.ownKeys(definition.getTags())));
        }

        return [...new Set(tags)];
    }

    /**
     * Returns all tags not queried by findTaggedServiceIds.
     *
     * @return string[]
     */
    public  findUnusedTags()
    {
        const unusedTags = this.findTags().filter( (tag: any,) => !this.usedTags.includes(tag));

        return unusedTags;

        // return array_values(array_diff(this.findTags(), this.usedTags));
    }

    /**
     * 
     * @param provider ExpressionFunctionProviderInterface
     */
    public  addExpressionLanguageProvider(provider: any)
    {
        // this.expressionLanguageProviders[] = provider;
    }

    /**
     * @return ExpressionFunctionProviderInterface[]
     */
    public  getExpressionLanguageProviders()
    {
        return this.expressionLanguageProviders;
    }

    /**
     * Returns a ChildDefinition that will be used for autoconfiguring the interface/class.
     *
     * @return ChildDefinition
     */
    public  registerForAutoconfiguration(_interface: string)
    {
        if (!(_interface in this.autoconfiguredInstanceof)) {
            this.autoconfiguredInstanceof[_interface] = new ChildDefinition('');
        }

        return this.autoconfiguredInstanceof[_interface];
    }

    /**
     * Registers an attribute that will be used for autoconfiguring annotated classes.
     *
     * The third argument passed to the callable is the reflector of the
     * class/method/property/parameter that the attribute targets. Using one or many of
     * \ReflectionClass|\ReflectionMethod|\ReflectionProperty|\ReflectionParameter as a type-hint
     * for this argument allows filtering which attributes should be passed to the callable.
     *
     * @template T
     *
     * @param class-string<T>                                attributeClass
     * @param callable(ChildDefinition, T, \Reflector): void configurator
     */
    public  registerAttributeForAutoconfiguration(attributeClass: string, configurator: () => any): void
    {
        this.autoconfiguredAttributes[attributeClass] = configurator;
    }

    /**
     * Registers an autowiring alias that only binds to a specific argument name.
     *
     * The argument name is derived from name if provided (from id otherwise)
     * using camel case: "foo.bar" or "foo_bar" creates an alias bound to
     * "fooBar"-named arguments with type as type-hint. Such arguments will
     * receive the service id when autowiring is used.
     */
    public  registerAliasForArgument(id: string, type: string, name: string = null as any): Alias
    {
        // name = (new Target(name ?? id)).name;

        name = name?? id;

        if (!(/^[a-zA-Z_\x7f-\xff]/.test(name))) {
            throw new InvalidArgumentException(`Invalid argument name "${name}" for service "${id}": the first character must be a letter.`);
        }

        return this.setAlias(type +' ' + name, id);
    }

    /**
     * Returns an array of ChildDefinition[] keyed by interface.
     *
     * @return array<string, ChildDefinition>
     */
    public  getAutoconfiguredInstanceof()
    {
        return this.autoconfiguredInstanceof;
    }

    /**
     * @return array<string, callable>
     */
    public  getAutoconfiguredAttributes(): {[i:string]: any}
    {
        return this.autoconfiguredAttributes;
    }

    /**
     * Resolves env parameter placeholders in a string or an array.
     *
     * @param mixed            value     The value to resolve
     * @param string|true|null format    A sprintf() format returning the replacement for each env var name or
     *                                    null to resolve back to the original "%env(VAR)%" format or
     *                                    true to resolve to the actual values of the referenced env vars
     * @param array            &usedEnvs Env vars found while resolving are added to this array
     *
     * @return mixed The value with env parameters resolved if a string or an array is passed
     */
    public  resolveEnvPlaceholders(value: any, format: any = null, usedEnvs: any = null): any
    {
        // throw new RuntimeException("resolveEnvPlaceholders not supported")
        if (null == format) {
            format = '%%env(%s)%%';
        }

        const bag = this.getParameterBag();
        
        if (true === format) {
            value = bag.resolveValue(value);
        }

        if (value instanceof Definition) {
            value = JSON.parse(JSON.stringify(value));
        }

        if ((typeof value == 'object') && value.constructor == Object ) {
            const result: {[i:string]: any} = {};
            for(const k in value) {
                const v = value[k];
                result[(typeof k == 'string')? this.resolveEnvPlaceholders(k, format, usedEnvs) : k] = this.resolveEnvPlaceholders(v, format, usedEnvs);
            }

            return result;
        }

        if (!(typeof value == 'string') || 38 > value.length || !value.match('/env[_(]/i')) {
            return value;
        }
        const envPlaceholders = (bag instanceof EnvPlaceholderParameterBag )? bag.getEnvPlaceholders() : this.envPlaceholders;

        var completed = false;
        var resolved: any;

        stage_1: for(const env in envPlaceholders) {
            const placeholders = envPlaceholders[env];

            for(const placeholder of placeholders) {

                if (RegExp(`${placeholder}`).test(value)) {
                    if (true === format) {
                        resolved = bag.escapeValue(this.getEnv(env));
                    } else {
                        resolved = format.replace('%s',env);
                    }
                    if (placeholder === value) {
                        value = resolved;
                        completed = true;
                    } else {
                        if (!(typeof resolved == 'string') && !(typeof resolved == 'number')) {
                            throw new RuntimeException(`A string value must be composed of strings and/or numbers, but found parameter "env(${env})" of type "${typeof resolved}" inside string value "${this.resolveEnvPlaceholders(value)}".`);
                        }
                        value = value.replace(placeholder, resolved);
                    }
                    usedEnvs[env] = env;
                    this.envCounters[env] = (env in this.envCounters) ? 1 + this.envCounters[env] : 1;

                    if (completed) {
                        break stage_1;
                    }
                }
            }
        }

        return value;
    }

    /**
     * Get statistics about env usage.
     *
     * @return int[] The number of time each env vars has been resolved
     */
    public  getEnvCounters()
    {
        // const bag = this.getParameterBag();
        // const envPlaceholders = bag instanceof EnvPlaceholderParameterBag ? bag.getEnvPlaceholders() : this.envPlaceholders;

        // foreach (envPlaceholders as env : placeholders) {
        //     if (!isset(this.envCounters[env])) {
        //         this.envCounters[env] = 0;
        //     }
        // }

        // return this.envCounters;
    }

    /**
     * @final
     */
    public  log(pass: CompilerPass, message: string)
    {
        this.getCompiler().log(pass, this.resolveEnvPlaceholders(message));
    }

    /**
     * Checks whether a class is available and will remain available in the "no-dev" mode of Composer.
     *
     * When parent packages are provided and if any of them is in dev-only mode,
     * the class will be considered available even if it is also in dev-only mode.
     */
    public static  willBeAvailable(_package: string, serviceClass: any, parentPackages: string[]): boolean
    {
        const skipDeprecation: any = 3 < arguments.length && arguments[3];
        const hasRuntimeApi = true;//class_exists(InstalledVersions::class);

        if (!hasRuntimeApi && !skipDeprecation) {
            console.warn('symfony/dependency-injection', '5.4', 'Calling "%s" when dependencies have been installed with Composer 1 is deprecated. Consider upgrading to Composer 2.');
        }

        // if (!class_exists(class) && !interface_exists(class, false) && !trait_exists(class, false)) {
        //     return false;
        // }

        if (!(typeof serviceClass === 'function') /*&& !interface_exists(class, false) && !trait_exists(class, false)*/) {
            return false;
        }

        // if (!hasRuntimeApi || !InstalledVersions::isInstalled(package) || InstalledVersions::isInstalled(package, false)) {
        //     return true;
        // }

        // the package is installed but in dev-mode only, check if this applies to one of the parent packages too

        // rootPackage = InstalledVersions::getRootPackage()['name'] ?? '';

        // if ('symfony/symfony' === rootPackage) {
        //     return true;
        // }

        // foreach (parentPackages as parentPackage) {
        //     if (rootPackage === parentPackage || (InstalledVersions::isInstalled(parentPackage) && !InstalledVersions::isInstalled(parentPackage, false))) {
        //         return true;
        //     }
        // }

        return false;
    }

    /**
     * Gets removed binding ids.
     *
     * @return array<int, bool>
     *
     * @internal
     */
    public  getRemovedBindingIds(): boolean[]
    {
        return this.removedBindingIds;
    }

    /**
     * Removes bindings for a service.
     *
     * @internal
     */
    public  removeBindings(id: string)
    {
        if (this.hasDefinition(id)) {
            const bindings = this.getDefinition(id).getBindings();

            for(const k in bindings) {
                const binding = bindings[k];

                const [, bindingId] = binding.getValues();
                this.removedBindingIds[ Number(bindingId)] = true;
            }
        }
    }

    /**
     * Returns the Service Conditionals.
     *
     * @param mixed value An array of conditionals to return
     *
     * @return string[]
     *
     * @internal
     */
    public static  getServiceConditionals(value: any): any[]
    {
        var services: any[] = [];

        if (Array.isArray(value)) {
            for(const v of value) {
                services = services.concat(ContainerBuilder.getServiceConditionals(v));
                services = [...new Set(services)];

            }
        }
        else
        if (value instanceof Reference && InvalidServiceBehavior.IGNORE_ON_INVALID_REFERENCE === value.getInvalidBehavior()) {
            services.push(String(value));
        }

        return services;
    }

    /**
     * Returns the initialized conditionals.
     *
     * @param mixed value An array of conditionals to return
     *
     * @return string[]
     *
     * @internal
     */
    public static  getInitializedConditionals(value: any): any[]
    {
        var services: any[] = [];

        if (Array.isArray(value)) {
            for(const v of value) {
                services = services.concat(ContainerBuilder.getServiceConditionals(v));
                services = [...new Set(services)];
            }
        } 
        else
        if (value instanceof Reference && InvalidServiceBehavior.IGNORE_ON_UNINITIALIZED_REFERENCE === value.getInvalidBehavior()) {
            services.push(String(value));
        }

        return services;
    }

    /**
     * Computes a reasonably unique hash of a value.
     *
     * @param mixed value A serializable value
     *
     * @return string
     */
    public static  hash(value: any)
    {
        throw new RuntimeException("BadMethodCallException: Hash not implemented on containers");
        // hash = substr(base64_encode(hash('sha256', serialize(value), true)), 0, 7);

        // return str_replace(['/', '+'], ['.', '_'], hash);
    }

    /**
     * {@inheritdoc}
     */
    protected  getEnv(name: string)
    {
        var value = super.getEnv(name);
        const bag = this.getParameterBag();

        if (!(typeof value == 'string') || !(bag instanceof EnvPlaceholderParameterBag)) {
            return value;
        }

    //     envPlaceholders = bag.getEnvPlaceholders();
    //     if (isset(envPlaceholders[name][value])) {
    //         bag = new ParameterBag(bag.all());

    //         return bag.unescapeValue(bag.get("env(name)"));
    //     }
    //     foreach (envPlaceholders as env : placeholders) {
    //         if (isset(placeholders[value])) {
    //             return this.getEnv(env);
    //         }
    //     }

    //     this.resolving["env(name)"] = true;
    //     try {
    //         return bag.unescapeValue(this.resolveEnvPlaceholders(bag.escapeValue(value), true));
    //     } finally {
    //         unset(this.resolving["env(name)"]);
    //     }
    }

    private  callMethod(service: object, call: any[], inlineServices: any)
    {
        for(const s of ContainerBuilder.getServiceConditionals(call[1])) {
            if (!this.has(s)) {
                return service;
            }
        }
        for(const s of ContainerBuilder.getInitializedConditionals(call[1])) {
            if (!this.doGet(s, InvalidServiceBehavior.IGNORE_ON_UNINITIALIZED_REFERENCE, inlineServices)) {
                return service;
            }
        }

        const result = (<any>service)[call[0]](...this.doResolveServices(this.getParameterBag().unescapeValue(this.getParameterBag().resolveValue(call[1])), inlineServices));

        return (!call[2]) ? service : result;
    }

    /**
     * Shares a given service in the container.
     *
     * @param mixed service
     */
    private  shareService(definition: Definition, service: object,id: string, inlineServices: any)
    {
        // inlineServices[id ?? spl_object_hash(definition)] = service;

        if (null !== id && definition.isShared()) {
            this.services[id] = service;
            delete(this.loading[id]);
        }
    }

    private  getExpressionLanguage()//: ExpressionLanguage
    {
        throw new RuntimeException("BadMethodCallException: getExpressionLanguage()");
        // if (null === this.expressionLanguage) {
        //     if (!class_exists(\Symfony\Component\ExpressionLanguage\ExpressionLanguage::class)) {
        //         throw new LogicException('Unable to use expressions as the Symfony ExpressionLanguage component is not installed.');
        //     }
        //     this.expressionLanguage = new ExpressionLanguage(null, this.expressionLanguageProviders);
        // }

        // return this.expressionLanguage;
    }

    private  inVendors(path: string): boolean
    {
        // if (null === this.vendors) {
        //     this.vendors = (new ComposerResource()).getVendors();
        // }
        // path = realpath(path) ?: path;

        // foreach (this.vendors as vendor) {
        //     if (str_starts_with(path, vendor) && false !== strpbrk(substr(path, \strlen(vendor), 1), '/'.\DIRECTORY_SEPARATOR)) {
        //         this.addResource(new FileResource(vendor.'/composer/installed.json'));

        //         return true;
        //     }
        // }

        return false;
    }
}


// export {MergeExtensionConfigurationPass};
export default ContainerBuilder;
