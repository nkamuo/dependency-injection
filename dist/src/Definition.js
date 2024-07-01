"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Definition = void 0;
const Container_1 = require("./Container");
const Reference_1 = require("./Reference");
class Definition {
    constructor(serviceClass = null, args = []) {
        /*
         * @internal
         *
         * Used to store the behavior to follow when using service decoration and the decorated service is invalid
         */
        // public decorationOnInvalid;
        // protected arguments: {[i:string]: any} = {};
        this.arguments = {};
        this.file = null;
        this.shared = true;
        this.deprecation = {};
        this.properties = {};
        this.calls = [];
        this._instanceof = [];
        this.autoconfigured = false;
        this.tags = {};
        this.is_public = false;
        this.synthetic = false;
        this.is_abstract = false;
        this.lazy = false;
        this.decoratedService = [];
        this.autowired = false;
        this.changes = {};
        this.bindings = [];
        this.errors = [];
        this.currenctArgumentKey = 0;
        if (null !== serviceClass) {
            this.setClass(serviceClass);
        }
        this.arguments = args;
    }
    /**
     * Returns all changes tracked for the Definition object.
     *
     * @return array
     */
    getChanges() {
        return this.changes;
    }
    /**
     * Sets the tracked changes for the Definition object.
     *
     * @param changes changes An array of changes for this Definition
     *
     * @return this
     */
    setChanges(changes) {
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
    setFactory(factory) {
        this.changes.factory = true;
        if ((typeof factory === 'string') && factory.match('::')) {
            factory = factory.split('::');
        }
        else if (factory instanceof Reference_1.Reference) {
            factory = [factory, '__invoke'];
        }
        this.factory = factory;
        return this;
    }
    /**
     * Gets the factory.
     *
     * @return string|array|null The PHP  or an array containing a class/Reference and a method to call
     */
    getFactory() {
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
    setDecoratedService(id, renamedId = null, priority = 0, invalidBehavior = Container_1.InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE) {
        if (renamedId && id === renamedId) {
            throw new Error(`The decorated service inner name for "{id}" must be different than the service name itself.`);
        }
        this.changes.decorated_service = true;
        if (null === id) {
            this.decoratedService = null;
        }
        else {
            this.decoratedService = [id, renamedId, priority];
            if (Container_1.InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE !== invalidBehavior) {
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
    getDecoratedService() {
        return this.decoratedService;
    }
    /**
     * Sets the service class.
     *
     * @return this
     */
    setClass(serviceClass) {
        this.changes['service_class'] = true;
        this.serviceClass = serviceClass;
        return this;
    }
    /**
     * Gets the service class.
     *
     * @return string|null
     */
    getClass() {
        return this.serviceClass;
    }
    /**
     * Sets the arguments to pass to the service constructor/factory method.
     *
     * @return this
     */
    setArguments(args) {
        this.arguments = args;
        return this;
    }
    /**
     * Sets the properties to define when creating the service.
     *
     * @return this
     */
    setProperties(properties) {
        this.properties = properties;
        return this;
    }
    /**
     * Gets the properties to define when creating the service.
     *
     * @return array
     */
    getProperties() {
        return this.properties;
    }
    /**
     * Sets a specific property.
     *
     * @param value value
     *
     * @return this
     */
    setProperty(name, value) {
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
    addArgument(arg) {
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
    replaceArgument(index, arg) {
        var argumentSize = 0;
        if (0 === (argumentSize = Reflect.ownKeys(this.arguments.length).length)) {
            throw new Error(`Cannot replace arguments for class "${this.serviceClass}" if none have been configured yet.`);
        }
        if ((typeof index === 'number') && (index < 0 || index > (this.currenctArgumentKey))) {
            throw new Error(`The index "${index}" is not in the range [0, ${this.currenctArgumentKey}] of the arguments of class "${this.serviceClass}".`);
        }
        if (typeof (index) === 'string' && !(index in this.arguments)) {
            throw new Error(`The argument "${index}" doesn\'t exist in class "${this.serviceClass}".`);
        }
        this.arguments[index] = arg;
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
    setArgument(key, value) {
        if (typeof key === 'string' && Array.isArray(this.arguments))
            this.arguments = this.arguments.reduce((o, val, i) => { o[i] = value; return o; }, {});
        this.arguments[key] = value;
        return this;
    }
    /**
     * Gets the arguments to pass to the service constructor/factory method.
     *
     * @return array
     */
    getArguments() {
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
    getArgument(index) {
        if (!(index in this.arguments)) {
            throw new Error(`The argument "${index}" doesn\'t exist in class "%s".`);
        }
        return this.arguments[index];
    }
    /**
     * Sets the methods to call after service initialization.
     *
     * @return this
     */
    setMethodCalls(calls = []) {
        var _a;
        // console.log('calls: ', calls);
        if ((calls === null || calls === void 0 ? void 0 : calls.length) > 0) {
            var index;
            this.calls = [];
            for (index in calls) {
                if (index === 'hashCode')
                    continue;
                const call = calls[index];
                // console.log('calls: ', call);
                if (Array.isArray(call) && call.length >= 2)
                    this.addMethodCall(call[0], call[1], (_a = call[2]) !== null && _a !== void 0 ? _a : false);
                else
                    throw new Container_1.InvalidArgumentException(`Invalid Call configuration provided, \"${call}\"`);
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
    addMethodCall(method, args = [], returnsClone = false) {
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
    removeMethodCall(method) {
        for (var i in this.calls) {
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
    hasMethodCall(method) {
        for (var i in this.calls) {
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
    getMethodCalls() {
        return this.calls;
    }
    /**
     * Sets the definition templates to conditionally apply on the current definition, keyed by parent interface/class.
     *
     * @param ChildDefinition[] instanceof
     *
     * @return this
     */
    setInstanceofConditionals(_instanceof) {
        this._instanceof = _instanceof;
        return this;
    }
    /**
     * Gets the definition templates to conditionally apply on the current definition, keyed by parent interface/class.
     *
     * @return ChildDefinition[]
     */
    getInstanceofConditionals() {
        return this._instanceof;
    }
    /**
     * Sets whether or not instanceof conditionals should be prepended with a global set.
     *
     * @return this
     */
    setAutoconfigured(autoconfigured) {
        this.changes['autoconfigured'] = true;
        this.autoconfigured = autoconfigured;
        return this;
    }
    /**
     * @return bool
     */
    isAutoconfigured() {
        return this.autoconfigured;
    }
    /**
     * Sets tags for this definition.
     *
     * @return this
     */
    setTags(tags) {
        this.tags = tags;
        return this;
    }
    /**
     * Returns all tags.
     *
     * @return array
     */
    getTags() {
        return this.tags;
    }
    /**
     * Gets a tag by name.
     *
     * @return array
     */
    getTag(name) {
        var _a;
        return (_a = this.tags[name]) !== null && _a !== void 0 ? _a : [];
    }
    /**
     * Adds a tag for this definition.
     *
     * @return this
     */
    addTag(name, attributes = {}) {
        if (!(name in this.tags))
            this.tags[name] = [];
        this.tags[name].push(attributes);
        return this;
    }
    /**
     * Whether this definition has a tag with the given name.
     *
     * @return bool
     */
    hasTag(name) {
        return name in this.tags;
    }
    /**
     * Clears all tags for a given name.
     *
     * @return this
     */
    clearTag(name) {
        delete this.tags[name];
        return this;
    }
    /**
     * Clears the tags for this definition.
     *
     * @return this
     */
    clearTags() {
        this.tags = {};
        return this;
    }
    /**
     * Sets a file to require before creating the service.
     *
     * @return this
     */
    setFile(file) {
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
    getFile() {
        return this.file;
    }
    /**
     * Sets if the service must be shared or not.
     *
     * @return this
     */
    setShared(shared) {
        this.changes['shared'] = true;
        this.shared = shared;
        return this;
    }
    /**
     * Whether this service is shared.
     *
     * @return bool
     */
    isShared() {
        return this.shared;
    }
    /**
     * Sets the visibility of this service.
     *
     * @return this
     */
    setPublic(is_public) {
        this.changes['public'] = true;
        this.is_public = is_public;
        return this;
    }
    /**
     * Whether this service is public facing.
     *
     * @return bool
     */
    isPublic() {
        return this.is_public;
    }
    /**
     * Sets if this service is private.
     *
     * @return this
     *
     * @deprecated since Symfony 5.2, use setPublic() instead
     */
    setPrivate(is_private) {
        // trigger_deprecation('symfony/dependency-injection', '5.2', 'The "%s()" method is deprecated, use "setPublic()" instead.', __METHOD__);
        console.warn('Method Definition setprivate is depricated');
        return this.setPublic(!is_private);
    }
    /**
     * Whether this service is private.
     *
     * @return bool
     */
    isPrivate() {
        return !this.is_public;
    }
    /**
     * Sets the lazy flag of this service.
     *
     * @return this
     */
    setLazy(lazy) {
        this.changes['lazy'] = true;
        this.lazy = lazy;
        return this;
    }
    /**
     * Whether this service is lazy.
     *
     * @return bool
     */
    isLazy() {
        return this.lazy;
    }
    /**
     * Sets whether this definition is synthetic, that is not constructed by the
     * container, but dynamically injected.
     *
     * @return this
     */
    setSynthetic(synthetic) {
        this.synthetic = synthetic;
        if (!('public' in this.changes)) {
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
    isSynthetic() {
        return this.synthetic;
    }
    /**
     * Whether this definition is abstract, that means it merely serves as a
     * template for other definitions.
     *
     * @return this
     */
    setAbstract(is_abstract) {
        this.is_abstract = is_abstract;
        return this;
    }
    /**
     * Whether this definition is abstract, that means it merely serves as a
     * template for other definitions.
     *
     * @return bool
     */
    isAbstract() {
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
    setDeprecated( /* string package, string version, string message */) {
        var _a, _b;
        var args = arguments;
        var _package, version;
        if (args.length < 3) {
            console.warn('symfony/dependency-injection', '5.1', 'The signature of method "%s()" requires 3 arguments: "string package, string version, string message", not defining them is deprecated.', 'setDeprecation');
            var status = (_a = args[0]) !== null && _a !== void 0 ? _a : true;
            if (!status) {
                console.warn('symfony/dependency-injection', '5.1', 'Passing a null message to un-deprecate a node is deprecated.');
            }
            var message = String((_b = args[1]) !== null && _b !== void 0 ? _b : null);
            _package = version = '';
        }
        else {
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
        this.deprecation = status ? { 'package': _package, version, message: message !== null && message !== void 0 ? message : Definition.DEFAULT_DEPRECATION_TEMPLATE } : {};
        return this;
    }
    /**
     * Whether this definition is deprecated, that means it should not be called
     * anymore.
     *
     * @return bool
     */
    isDeprecated() {
        return Reflect.ownKeys(this.deprecation).length > 0 ? true : false;
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
    getDeprecationMessage(id) {
        console.warn('symfony/dependency-injection', '5.1', 'The "%s()" method is deprecated, use "getDeprecation()" instead.', 'getDeprecationMessage');
        return this.getDeprecation(id)['message'];
    }
    /**
     * @param string id Service id relying on this definition
     */
    getDeprecation(id) {
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
    setConfigurator(configurator) {
        this.changes['configurator'] = true;
        if ((typeof configurator === 'string') && configurator.includes('::')) {
            configurator = configurator.split('::');
        }
        else if (configurator instanceof Reference_1.Reference) {
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
    getConfigurator() {
        return this.configurator;
    }
    /**
     * Is the definition autowired?
     *
     * @return bool
     */
    isAutowired() {
        return this.autowired;
    }
    /**
     * Enables/disables autowiring.
     *
     * @return this
     */
    setAutowired(autowired) {
        this.changes['autowired'] = true;
        this.autowired = autowired;
        return this;
    }
    /**
     * Gets bindings.
     *
     * @return BoundArgument[]
     */
    getBindings() {
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
    setBindings(bindings) {
        throw new Container_1.RuntimeException("Method not Implemented well");
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
    addError(error) {
        if (error instanceof Definition) {
            this.errors = this.errors.concat(error.errors);
        }
        else {
            this.errors.push(error);
        }
        return this;
    }
    /**
     * Returns any errors that occurred while building this Definition.
     *
     * @return array
     */
    getErrors() {
        for (const i in this.errors) {
            if (i === 'hashCode')
                continue;
            const error = this.errors[i];
            if (typeof error === 'function') {
                this.errors[i] = String(error());
            }
            else if (!(typeof error === 'string')) {
                this.errors[i] = String(error);
            }
        }
        return this.errors;
    }
    hasErrors() {
        return Reflect.ownKeys(this.errors).length > 0 ? true : false;
    }
}
exports.Definition = Definition;
Definition.DEFAULT_DEPRECATION_TEMPLATE = 'The "%service_id%" service is deprecated. You should stop using it, as it will be removed in the future.';
exports.default = Definition;
