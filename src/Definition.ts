import { BoundArgument } from './Argument/BoundArgument';
import { InvalidArgumentException, InvalidServiceBehavior, RuntimeException } from './Container';
import ContainerBuilder from './ContainerBuilder';
import { Reference } from './Reference';

export class Definition<T = any>
{
    /**
     * @internal
     *
     * Used to store the name of the inner id when using service decoration together with autowiring
     */
     public innerServiceId?: string;

    /*
     * @internal
     *
     * Used to store the behavior to follow when using service decoration and the decorated service is invalid
     */
    // public decorationOnInvalid;

    // protected arguments: {[i:string]: any} = {};
    protected arguments: {[i:string]: any} = {};


    private static readonly DEFAULT_DEPRECATION_TEMPLATE = 'The "%service_id%" service is deprecated. You should stop using it, as it will be removed in the future.';


    private serviceClass!: Function|string;
    private file: string = null as any;
    private factory: any;
    private shared = true;
    private deprecation: {[i:string]: any} = {};
    private properties: {[i: string]: any}  = {};
    private calls: any[] = [];
    private _instanceof = [];
    private autoconfigured = false;
    private configurator: any;
    private tags: {[l:string]: any[]} = {};
    private is_public = false;
    private synthetic = false;
    private is_abstract = false;
    private lazy = false;
    private decoratedService: Array<string|number> = [];
    private autowired = false;
    private changes: {[i: string]: boolean} = {};
    private bindings: BoundArgument[] = [];
    private errors: any[] = [];
    private _activationListeners: ActivationHandler<T>[]  = [];
    private _deactivationHandlers:DeactivationHandler<T>[] = [];


    public get activationListeners(){
        return this._activationListeners;
    }

    public get deactivationHandlers(){
        return this._deactivationHandlers;
    }

    private currenctArgumentKey = 0;

    public constructor(serviceClass: Function|string = null as any, args: any[] = []) {
        if (null !== serviceClass && undefined !== serviceClass) {
            this.setClass(serviceClass);
        }
        this.arguments = args;
    }

    public onActivated(handler: ActivationHandler<T>){
        this._activationListeners.push(handler);
    }

    public onDeactivated(handler: DeactivationHandler<T>){
        this._deactivationHandlers.push(handler);
    }

    /**
     * Returns all changes tracked for the Definition object.
     *
     * @return array
     */
     public getChanges()
     {
         return this.changes;
     }
 
     /**
      * Sets the tracked changes for the Definition object.
      *
      * @param changes changes An array of changes for this Definition
      *
      * @return this
      */
     public setChanges(changes: {[i: string]: boolean})
     {
         this.changes = changes;
 
         return this;
     }
 
     /**
      * Sets a factory.
      *
      * @param factory factory A js , reference or an array containing a class/Reference and a method to call
      *
      * @return this
      */
     public setFactory(factory: ((...args: any[]) => any)|string|Array<Reference|string>|Reference|null)
     {
         this.changes.factory = true;
 
         if ( (typeof factory === 'string') && factory.match('::')) {
             factory = factory.split('::');
         }
         else
            if (factory instanceof Reference) {
                factory = [factory, '__invoke'];
            }
 
         this.factory = factory;
 
         return this;
     }
     
     /**
      * alias for setFactory
      */
     public withFactory(factory: ((...args: any[]) => any)|string|Array<Reference|string>|Reference|null){
        return this.setFactory(factory);
     }

     /**
      * alias for withFactory
      */
     public toFactory(factory: ((...args: any[]) => any)|string|Array<Reference|string>|Reference|null){
        return this.setFactory(factory);
     }
 
     /**
      * Gets the factory.
      *
      * @return string|array|null The PHP  or an array containing a class/Reference and a method to call
      */
     public getFactory()
     {
         return this.factory;
     }
 
     /**
      * Sets the service that this service is decorating.
      *
      * @param string|null id        The decorated service id, use null to remove decoration
      * @param string|null renamedId The new decorated service id
      *
      * @return this
      *
      * @throws InvalidArgumentException in case the decorated service id and the new decorated service id are equals
      */
     public setDecoratedService(
        id: string,
        renamedId:string = null as any,
        priority: number|string = 0,
        invalidBehavior = InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE
        )
     {
         if (renamedId && id === renamedId) {
             throw new Error(`The decorated service inner name for "{id}" must be different than the service name itself.`);
         }
 
         this.changes.decorated_service = true;
 
         if (null === id) {
             this.decoratedService = null as any;
         } else {
             this.decoratedService = [id, renamedId, priority];
 
             if (InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE !== invalidBehavior) {
                 this.decoratedService.push(invalidBehavior);
             }
         }
 
         return this;
     }


         /**
     * Gets the service that this service is decorating.
     *
     * @return array|null An array composed of the decorated service id, the new id for it and the priority of decoration, null if no service is decorated
     */
    public  getDecoratedService()
    {
        return this.decoratedService;
    }

    /**
     * Sets the service class.
     *
     * @return this
     */
    public  setClass(serviceClass: any)
    {
        this.changes['service_class'] = true;

        this.serviceClass = serviceClass;

        return this;
    }

    /**
     * Gets the service class.
     *
     * @return string|null
     */
    public  getClass()
    {
        return this.serviceClass;
    }

    /**
     * Sets the arguments to pass to the service constructor/factory method.
     *
     * @return this
     */
    public setArguments(args: any[]|{[i:string]: any})
    {
        this.arguments = args;

        return this;
    }

    /**
     * Sets the properties to define when creating the service.
     *
     * @return this
     */
    public  setProperties(properties: any[])
    {
        this.properties = properties;

        return this;
    }

    /**
     * Gets the properties to define when creating the service.
     *
     * @return array
     */
    public  getProperties()
    {
        return this.properties;
    }

    /**
     * Sets a specific property.
     *
     * @param value value
     *
     * @return this
     */
    public  setProperty(name: string, value: any)
    {
        this.properties[name] = value;

        return this;
    }

    /**
     * Adds an argument to pass to the service constructor/factory method.
     *
     * @param arg argument An argument
     *
     * @return this
     */
    public  addArgument(arg: any)
    {
        this.arguments[this.currenctArgumentKey++] = arg;

        // Object.assign(this.arguments,arg);

        return this;
    }

    /**
     * Replaces a specific argument.
     *
     * @param index  int|string index
     * @param arg mixed      argument
     *
     * @return this
     *
     * @throws OutOfBoundsException When the replaced argument does not exist
     */
    public  replaceArgument(index: number|string, arg: any)
    {
        var argumentSize = 0;
        if (0 === (argumentSize = Reflect.ownKeys(this.arguments.length).length)) {
            throw new Error(`Cannot replace arguments for class "${this.serviceClass}" if none have been configured yet.`);
        }

        if ((typeof index === 'number') && (index < 0 || index > (this.currenctArgumentKey))) {
            throw new Error(`The index "${index}" is not in the range [0, ${this.currenctArgumentKey}] of the arguments of class "${this.serviceClass}".`);
        }

        if ( typeof(index) === 'string' && !( index in this.arguments)) {
            throw new Error(`The argument "${index}" doesn\'t exist in class "${this.serviceClass}".`);
        }

        this.arguments[(<string>index)] = arg;

        return this;
    }

    /**
     * Sets a specific argument.
     *
     * @param int|string key
     * @param mixed      value
     *
     * @return this
     */
    public  setArgument(key: number|string, value: any)
    {
        if(typeof key === 'string' && Array.isArray(this.arguments))
            this.arguments = this.arguments.reduce((o: {[i:string]:any},val: any,i: number) => { o[i] = value; return o; },{});
            
        this.arguments[(<string>key)] = value;

        return this;
    }

    /**
     * Gets the arguments to pass to the service constructor/factory method.
     *
     * @return array
     */
    public  getArguments()
    {
        return this.arguments;
    }

    /**
     * Gets an argument to pass to the service constructor/factory method.
     *
     * @param int|string index
     *
     * @return mixed
     *
     * @throws OutOfBoundsException When the argument does not exist
     */
    public  getArgument(index: number|string)
    {
        if (!(index in this.arguments)) {
            throw new Error(`The argument "${index}" doesn\'t exist in class "%s".`);
        }

        return this.arguments[(<string>index)];
    }

    /**
     * Sets the methods to call after service initialization.
     *
     * @return this
     */
    public  setMethodCalls(calls: any[] = [])
    {
        // console.log('calls: ', calls);
        if(calls?.length > 0){
            
            var index: any;
            this.calls = [];

            for(index in calls) {

                if(index === 'hashCode')
                    continue;

                const call = calls[(<any>index)];
                
            // console.log('calls: ', call);

                if(Array.isArray(call) && call.length >= 2)
                    this.addMethodCall(call[0], call[1], call[2] ?? false);
                else
                throw new InvalidArgumentException(`Invalid Call configuration provided, \"${call}\"`)
            }
        }

        return this;
    }

    /**
     * Adds a method to call after service initialization.
     *
     * @param string method       The method name to call
     * @param array  arguments    An array of arguments to pass to the method call
     * @param bool   returnsClone Whether the call returns the service instance or not
     *
     * @return this
     *
     * @throws InvalidArgumentException on empty method param
     */
    public  addMethodCall(method: string, args: any[]|{[i:string]: any} = [], returnsClone = false)
    {
        if (!method) {
            throw new Error('Method name cannot be empty.');
        }
        this.calls.push(returnsClone ? [method, args, true] : [method, args]);

        return this;
    }

    /**
     * Removes a method to call after service initialization.
     *
     * @return this
     */
    public  removeMethodCall(method: string)
    {
        for(var i in this.calls) {
            const call = this.calls[i];

            if (call[0] === method) {
                delete this.calls[i];
            }
        }

        return this;
    }

    /**
     * Check if the current definition has a given method to call after service initialization.
     *
     * @return bool
     */
    public  hasMethodCall(method: string)
    {
        for(var i in this.calls) {
            const call = this.calls[i];
            if (call[0] === method) {
                return true;
            }
        }

        return false;
    }

    /**
     * Gets the methods to call after service initialization.
     *
     * @return array
     */
    public  getMethodCalls()
    {
        return this.calls;
    }

    /**
     * Sets the definition templates to conditionally apply on the current definition, keyed by parent interface/class.
     *
     * @param ChildDefinition[] instanceof
     *
     * @return this
     */
    public setInstanceofConditionals( _instanceof: any)
    {
        this._instanceof = _instanceof;

        return this;
    }

    /**
     * Gets the definition templates to conditionally apply on the current definition, keyed by parent interface/class.
     *
     * @return ChildDefinition[]
     */
    public  getInstanceofConditionals()
    {
        return this._instanceof;
    }

    /**
     * Sets whether or not instanceof conditionals should be prepended with a global set.
     *
     * @return this
     */
    public  setAutoconfigured(autoconfigured: boolean)
    {
        this.changes['autoconfigured'] = true;

        this.autoconfigured = autoconfigured;

        return this;
    }

    /**
     * @return bool
     */
    public  isAutoconfigured()
    {
        return this.autoconfigured;
    }

    /**
     * Sets tags for this definition.
     *
     * @return this
     */
    public  setTags(tags: {[i: string]: any[]} )
    {
        this.tags = tags;

        return this;
    }

    /**
     * Returns all tags.
     *
     * @return array
     */
    public  getTags()
    {
        return this.tags;
    }

    /**
     * Gets a tag by name.
     *
     * @return array
     */
    public  getTag(name: string)
    {
        return this.tags[name] ?? [];
    }

    /**
     * Adds a tag for this definition.
     *
     * @return this
     */
    public  addTag(name: string, attributes: {[i:string]: any} = {})
    {
        if(!(name in this.tags))
            this.tags[name] = [];
            
        this.tags[name].push(attributes);

        return this;
    }

    /**
     * Whether this definition has a tag with the given name.
     *
     * @return bool
     */
    public  hasTag(name: string)
    {
        return name in this.tags;
    }

    /**
     * Clears all tags for a given name.
     *
     * @return this
     */
    public  clearTag(name: string)
    {
        delete this.tags[name];

        return this;
    }

    /**
     * Clears the tags for this definition.
     *
     * @return this
     */
    public  clearTags()
    {
        this.tags = {};

        return this;
    }

    /**
     * Sets a file to require before creating the service.
     *
     * @return this
     */
    public  setFile(file: string)
    {
        this.changes['file'] = true;

        this.file = file;

        return this;
    }

    /**
     * Gets the file to require before creating the service.
     *
     * @return string|null
     * @deprecated 0.0.0 remove this please
     */
    public  getFile()
    {
        return this.file;
    }

    /**
     * Sets if the service must be shared or not.
     *
     * @return this
     */
    public  setShared(shared: boolean)
    {
        this.changes['shared'] = true;

        this.shared = shared;

        return this;
    }

    /**
     * Whether this service is shared.
     *
     * @return bool
     */
    public  isShared()
    {
        return this.shared;
    }

    /**
     * Sets the visibility of this service.
     *
     * @return this
     */
    public  setPublic(is_public = true)
    {
        this.changes['public'] = true;

        this.is_public = is_public?? true;

        return this;
    }


    /**
     * Whether this service is public facing.
     *
     * @return bool
     */
    public  isPublic()
    {
        return this.is_public;
    }

    /**
     * Sets if this service is private.
     *
     * @return this
     *
     * @deprecated since Symfony 5.2, use setPublic() instead
     */
    public  setPrivate(is_private: boolean = true)
    {
        // trigger_deprecation('symfony/dependency-injection', '5.2', 'The "%s()" method is deprecated, use "setPublic()" instead.', __METHOD__);

        console.warn('Method Definition setprivate is depricated');
        return this.setPublic(!is_private);
    }

    /**
     * Whether this service is private.
     *
     * @return bool
     */
    public  isPrivate()
    {
        return !this.is_public;
    }

    /**
     * Sets the lazy flag of this service.
     *
     * @return this
     */
    public  setLazy(lazy: boolean)
    {
        this.changes['lazy'] = true;

        this.lazy = lazy;

        return this;
    }

    /**
     * Whether this service is lazy.
     *
     * @return bool
     */
    public  isLazy()
    {
        return this.lazy;
    }

    /**
     * Sets whether this definition is synthetic, that is not constructed by the
     * container, but dynamically injected.
     *
     * @return this
     */
    public  setSynthetic(synthetic: boolean)
    {
        this.synthetic = synthetic;

        if (! ('public' in this.changes)) {
            this.setPublic(true);
        }

        return this;
    }

    /**
     * Whether this definition is synthetic, that is not constructed by the
     * container, but dynamically injected.
     *
     * @return bool
     */
    public  isSynthetic()
    {
        return this.synthetic;
    }

    /**
     * Whether this definition is abstract, that means it merely serves as a
     * template for other definitions.
     *
     * @return this
     */
    public  setAbstract(is_abstract: boolean)
    {
        this.is_abstract = is_abstract;

        return this;
    }

    /**
     * Whether this definition is abstract, that means it merely serves as a
     * template for other definitions.
     *
     * @return bool
     */
    public  isAbstract()
    {
        return this.is_abstract;
    }

    /**
     * Whether this definition is deprecated, that means it should not be called
     * anymore.
     *
     * @param string package The name of the composer package that is triggering the deprecation
     * @param string version The version of the package that introduced the deprecation
     * @param string message The deprecation message to use
     *
     * @return this
     *
     * @throws InvalidArgumentException when the message template is invalid
     */
    public  setDeprecated(/* string package, string version, string message */)
    {
        var args = arguments;

        var _package: string, version: string;

        if (args.length < 3) {
            console.warn('symfony/dependency-injection',
            '5.1',
            'The signature of method "%s()" requires 3 arguments: "string package, string version, string message", not defining them is deprecated.',
             'setDeprecation');

            var status = args[0] ?? true;

            if (!status) {
                console.warn('symfony/dependency-injection', '5.1', 'Passing a null message to un-deprecate a node is deprecated.');
            }

            var message =  String(args[1] ?? null);
             _package = version = '';
        } else {
            const status = true;
            _package = String(args[0]);
            version = String(args[1]);
            message = String(args[2]);
        }

        if ('' !== message) {
            if (message.match('#[\r\n]|\*/#')) {
                throw new Error('Invalid characters found in deprecation template.');
            }

            if (message.indexOf('%service_id%') == -1) {
                throw new Error('The deprecation template must contain the "%service_id%" placeholder.');
            }
        }

        this.changes['deprecated'] = true;
        this.deprecation = status ? { 'package': _package, version, message:  message ?? Definition.DEFAULT_DEPRECATION_TEMPLATE} : {};

        return this;
    }

    /**
     * Whether this definition is deprecated, that means it should not be called
     * anymore.
     *
     * @return bool
     */
    public  isDeprecated()
    {
        return Reflect.ownKeys(this.deprecation).length > 0? true : false;
    }

    /**
     * Message to use if this definition is deprecated.
     *
     * @deprecated since Symfony 5.1, use "getDeprecation()" instead.
     *
     * @param string id Service id relying on this definition
     *
     * @return string
     */
    public  getDeprecationMessage(id: string)
    {
        console.warn('symfony/dependency-injection', '5.1', 'The "%s()" method is deprecated, use "getDeprecation()" instead.', 'getDeprecationMessage');

        return this.getDeprecation(id)['message'];
    }

    /**
     * @param string id Service id relying on this definition
     */
    public  getDeprecation(id: string): {[i:string]: any}
    {
        return {
            'package': this.deprecation['package'],
            'version': this.deprecation['version'],
            'message': this.deprecation['message'].replace('%service_id%', id),
        };
    }

    /**
     * Sets a configurator to call after the service is fully initialized.
     *
     * @param string|array|Reference|null configurator A PHP , reference or an array containing a class/Reference and a method to call
     *
     * @return this
     */
    public  setConfigurator(configurator: any)
    {
        this.changes['configurator'] = true;

        if ((typeof configurator === 'string') && configurator.includes('::')) {
            configurator = configurator.split('::');
        }
        else
        if (configurator instanceof Reference) {
            configurator = [configurator, '__invoke'];
        }

        this.configurator = configurator;

        return this;
    }

    /**
     * Gets the configurator to call after the service is fully initialized.
     *
     * @return string|array|null
     */
    public  getConfigurator()
    {
        return this.configurator;
    }

    /**
     * Is the definition autowired?
     *
     * @return bool
     */
    public  isAutowired()
    {
        return this.autowired;
    }

    /**
     * Enables/disables autowiring.
     *
     * @return this
     */
    public  setAutowired(autowired: boolean)
    {
        this.changes['autowired'] = true;

        this.autowired = autowired;

        return this;
    }

    /**
     * Gets bindings.
     *
     * @return BoundArgument[]
     */
    public  getBindings()
    {
        return this.bindings;
    }

    /**
     * Sets bindings.
     *
     * Bindings map named or FQCN arguments to values that should be
     * injected in the matching parameters (of the constructor, of methods
     * called and of controller actions).
     *
     * @return this
     */
    public  setBindings( bindings: any[])
    {
        throw new RuntimeException("Method not Implemented well");

        // for(var key in bindings) {
        //     const binding = bindings[key];

        //     if (0 < strpos(key, '') && key !== k = preg_replace('/[ \t]*\/', ' ', key)) {
        //         unset(bindings[key]);
        //         bindings[key = k] = binding;
        //     }
        //     if (!binding instanceof BoundArgument) {
        //         bindings[key] = new BoundArgument(binding);
        //     }
        // }

        this.bindings = bindings;

        return this;
    }

    /**
     * Add an error that occurred when building this Definition.
     *
     * @param string|\Closure|self error
     *
     * @return this
     */
    public  addError(error: any)
    {
        if (error instanceof Definition) {
            this.errors = this.errors.concat(error.errors);
        } else {
            this.errors.push(error);
        }

        return this;
    }

    /**
     * Returns any errors that occurred while building this Definition.
     *
     * @return array
     */
    public  getErrors()
    {
         for(const i in this.errors) {
            
            if(i === 'hashCode')
            continue;

            const error = this.errors[i];
            
            if (typeof error === 'function') {
                this.errors[i] = String(error());
            }
            else
            if (!(typeof error === 'string')) {
                this.errors[i] = String(error);
            }
        }

        return this.errors;
    }

    public  hasErrors(): boolean
    {
        return Reflect.ownKeys(this.errors).length > 0? true : false;
    }

}


export default Definition;




export type ActivationHandler<T> = (input: ServiceActivationContext<T>) => void;
export type DeactivationHandler<T> = (input: ServiceDeactivationContext<T>) => void;

export interface ServiceActivationContext<T>{
    container: ContainerBuilder;
    service: T
}


export interface ServiceDeactivationContext<T>{
    container: ContainerBuilder;
    service: T
}