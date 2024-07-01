"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = exports.ServiceNotFoundException = exports.RuntimeException = exports.ServiceCircularReferenceException = exports.InvalidArgumentException = exports.InvalidServiceBehavior = void 0;
const index_1 = __importDefault(require("../libs/levenshtein/index"));
const EnvPlaceholderParameterBag_1 = require("./ParameterBag/EnvPlaceholderParameterBag");
const FrozenParameterBag_1 = require("./ParameterBag/FrozenParameterBag");
// import loadash from 'lodash';
var InvalidServiceBehavior;
(function (InvalidServiceBehavior) {
    InvalidServiceBehavior[InvalidServiceBehavior["RUNTIME_EXCEPTION_ON_INVALID_REFERENCE"] = 0] = "RUNTIME_EXCEPTION_ON_INVALID_REFERENCE";
    InvalidServiceBehavior[InvalidServiceBehavior["EXCEPTION_ON_INVALID_REFERENCE"] = 1] = "EXCEPTION_ON_INVALID_REFERENCE";
    InvalidServiceBehavior[InvalidServiceBehavior["NULL_ON_INVALID_REFERENCE"] = 2] = "NULL_ON_INVALID_REFERENCE";
    InvalidServiceBehavior[InvalidServiceBehavior["IGNORE_ON_INVALID_REFERENCE"] = 3] = "IGNORE_ON_INVALID_REFERENCE";
    InvalidServiceBehavior[InvalidServiceBehavior["IGNORE_ON_UNINITIALIZED_REFERENCE"] = 4] = "IGNORE_ON_UNINITIALIZED_REFERENCE";
})(InvalidServiceBehavior || (exports.InvalidServiceBehavior = InvalidServiceBehavior = {}));
class InvalidArgumentException extends Error {
}
exports.InvalidArgumentException = InvalidArgumentException;
class ServiceCircularReferenceException extends Error {
}
exports.ServiceCircularReferenceException = ServiceCircularReferenceException;
;
class RuntimeException extends Error {
}
exports.RuntimeException = RuntimeException;
class ServiceNotFoundException extends Error {
    constructor(...args) {
        super(args[4]);
    }
}
exports.ServiceNotFoundException = ServiceNotFoundException;
/**
 * Container is a dependency injection container.
 *
 * It gives access to object instances (services).
 * Services and parameters are simple key/pair stores.
 * The container can have four possible behaviors when a service
 * does not exist (or is not initialized for the last case):
 *
 *  * EXCEPTION_ON_INVALID_REFERENCE: Throws an exception (the default)
 *  * NULL_ON_INVALID_REFERENCE:      Returns null
 *  * IGNORE_ON_INVALID_REFERENCE:    Ignores the wrapping command asking for the reference
 *                                    (for instance, ignore a setter if the service does not exist)
 *  * IGNORE_ON_UNINITIALIZED_REFERENCE: Ignores/returns null for uninitialized services or invalid references
 *
 * @author Fabien Potencier <fabien@symfony.com>
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */
class Container {
    constructor(parameterBag = null) {
        this.services = {};
        this.privates = {};
        this.fileMap = {};
        this.methodMap = {};
        this.factories = {};
        this.aliases = {};
        this.loading = {};
        this.resolving = {};
        this.syntheticIds = {};
        this.envCache = {};
        this.compiled = false;
        this.parameterBag = parameterBag !== null && parameterBag !== void 0 ? parameterBag : new EnvPlaceholderParameterBag_1.EnvPlaceholderParameterBag();
        // this.parameterBag = parameterBag ?? new DefaultParameterBag();
    }
    /**
     * Compiles the container.
     *
     * This method does two things:
     *
     *  * Parameter values are resolved;
     *  * The parameter bag is frozen.
     */
    compile() {
        this.parameterBag.resolve();
        this.parameterBag = new FrozenParameterBag_1.FrozenParameterBag(this.parameterBag.all());
        this.compiled = true;
    }
    /**
     * Returns true if the container is compiled.
     *
     * @return bool
     */
    isCompiled() {
        return this.compiled;
    }
    /**
     * Gets the service container parameter bag.
     *
     * @return ParameterBagInterface
     */
    getParameterBag() {
        return this.parameterBag;
    }
    /**
     * Gets a parameter.
     *
     * @return array|bool|string|int|float|\UnitEnum|null
     *
     * @throws InvalidArgumentException if the parameter is not defined
     */
    getParameter(name) {
        return this.parameterBag.get(name);
    }
    /**
     * @return bool
     */
    hasParameter(name) {
        return this.parameterBag.has(name);
    }
    /**
     * Sets a parameter.
     *
     * @param string                                     name  The parameter name
     * @param array|bool|string|int|float|\UnitEnum|null value The parameter value
     */
    setParameter(name, value) {
        this.parameterBag.set(name, value);
    }
    /**
     * Sets a service.
     *
     * Setting a synthetic service to null resets it: has() returns false and get()
     * behaves in the same way as if the service was never created.
     */
    set(id, service) {
        // Runs the internal initializer; used by the dumped container to include always-needed files
        if (('service_container' in this.privates) && this.privates['service_container'] instanceof Function) {
            /** @var Function */
            var initialize = this.privates['service_container'];
            delete this.privates['service_container'];
            initialize();
        }
        if ('service_container' === id) {
            throw new InvalidArgumentException('You cannot set service "service_container".');
        }
        if (!((id in this.fileMap) || (id in this.methodMap))) {
            if (id in (this.syntheticIds) || !(id in this.getRemovedIds())) {
                // no-op
            }
            else if (null === service) {
                throw new InvalidArgumentException(`The "${id}" service is private, you cannot unset it.`);
            }
            else {
                throw new InvalidArgumentException(`The "${id}" service is private, you cannot replace it.`);
            }
        }
        else if ((id in this.services)) {
            throw new InvalidArgumentException(`The "${id}" service is already initialized, you cannot replace it.`);
        }
        if ((id in this.aliases)) {
            delete this.aliases[id];
        }
        if (null === service) {
            delete (this.services[id]);
            return;
        }
        this.services[id] = service;
    }
    /**
     * Returns true if the given service is defined.
     *
     * @param string id The service identifier
     *
     * @return bool
     */
    has(id) {
        if (id in (this.aliases)) {
            id = this.aliases[id];
        }
        if (id in this.services) {
            return true;
        }
        if ('service_container' === id) {
            return true;
        }
        return (id in this.fileMap) || (id in this.methodMap);
    }
    /**
     * Gets a service.
     *
     * @return object|null
     *
     * @throws ServiceCircularReferenceException When a circular reference is detected
     * @throws ServiceNotFoundException          When the service is not defined
     * @throws \Exception                        if an exception has been thrown when the service has been resolved
     *
     * @see Reference
     */
    get(id, invalidBehavior = InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE) {
        var _a, _b, _c, _d;
        return (_c = (_a = this.services[id]) !== null && _a !== void 0 ? _a : this.services[id = (_b = this.aliases[id]) !== null && _b !== void 0 ? _b : id]) !== null && _c !== void 0 ? _c : ('service_container' === id ? this : ((_d = this.factories[id]) !== null && _d !== void 0 ? _d : this.make(id, invalidBehavior)));
    }
    /**
     * Creates a service.
     *
     * As a separate method to allow "get()" to use the really fast `??` operator.
     */
    make(id, invalidBehavior) {
        if (id in this.loading) {
            throw new ServiceCircularReferenceException(id + Array.from(this.loading.keys()).concat([id]).toString());
        }
        this.loading[id] = true;
        try {
            if (id in (this.fileMap)) {
                return InvalidServiceBehavior.IGNORE_ON_UNINITIALIZED_REFERENCE === invalidBehavior ? null : this.load(this.fileMap[id]);
            }
            else if (id in (this.methodMap)) {
                // return InvalidServiceBehavior.IGNORE_ON_UNINITIALIZED_REFERENCE === invalidBehavior ? null : this.{this.methodMap[id]}();
                throw new Error("Complex situation is met");
            }
        }
        catch (e) {
            delete (this.services[id]);
            throw e;
        }
        finally {
            delete (this.loading[id]);
        }
        if ( /* self::EXCEPTION_ON_INVALID_REFERENCE */1 === invalidBehavior) {
            if (!id) {
                throw new ServiceNotFoundException(id);
            }
            if (id in (this.syntheticIds)) {
                throw new ServiceNotFoundException(id, null, null, [], (`The "%${id}" service is synthetic, it needs to be set at boot time before it can be used.`));
            }
            if (id in (this.getRemovedIds())) {
                throw new ServiceNotFoundException(id, null, null, [], (`The "${id}" service or alias has been removed or inlined when the container was compiled. You should either make it public, or stop using the container directly and use dependency injection instead.`));
            }
            const alternatives = [];
            for (const knownId of this.getServiceIds()) {
                if ('' === knownId || '.' === knownId[0]) {
                    continue;
                }
                const lev = (0, index_1.default)(id, knownId);
                if (lev <= id.length / 3 || id.indexOf(knownId) != -1) {
                    alternatives.push(knownId);
                }
            }
            throw new ServiceNotFoundException(id, null, null, alternatives);
        }
        return null;
    }
    /**
     * Returns true if the given service has actually been initialized.
     *
     * @return bool
     */
    initialized(id) {
        if ((id in this.aliases)) {
            id = this.aliases[id];
        }
        if ('service_container' === id) {
            return false;
        }
        return (id in this.services);
    }
    /**
     * {@inheritdoc}
     */
    reset() {
        const services = this.services.concat(this.privates);
        this.services = this.factories = this.privates = [];
        for (const service of services) {
            try {
                // if (service instanceof ResetInterface) {
                //     service.reset();
                // }
            }
            catch (e) {
                continue;
            }
        }
    }
    /**
     * Gets all service ids.
     *
     * @return string[]
     */
    getServiceIds() {
        var servicesIds = ['service_container']
            .concat(...Object.keys(this.fileMap))
            .concat(...Object.keys(this.methodMap))
            .concat(...Object.keys(this.aliases))
            .concat(...Object.keys(this.services));
        servicesIds = [...new Set(servicesIds)];
        return servicesIds.map(servicesId => String(servicesId));
    }
    /**
     * Gets service ids that existed at compile time.
     *
     * @return array
     */
    getRemovedIds() {
        return {};
    }
    /**
     * Camelizes a string.
     *
     * @return string
     */
    static camelize(id) {
        // return loadash.camelCase(id);
        return id.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }
    /**
     * A string to underscore.
     *
     * @return string
     */
    static underscore(id) {
        throw new RuntimeException("Conteiner::underscore is not implemented");
        // return loadash.underscore(id);
        // return strtolower(preg_replace(['/([A-Z]+)([A-Z][a-z])/', '/([a-z\d])([A-Z])/'], ['\\1_\\2', '\\1_\\2'], ));
    }
    /**
     * Creates a service by requiring its factory file.
     */
    load(file) {
        // return require(file);
        throw new Error("Method not implemented.");
    }
    /**
     * Fetches a variable from the environment.
     *
     * @return mixed
     *
     * @throws EnvNotFoundException When the environment variable is not found and has no default value
     */
    getEnv(name) {
        throw new Error("getEnv not supported");
        // if (isset(this.resolving[envName = "env(name)"])) {
        //     throw new ParameterCircularReferenceException(array_keys(this.resolving));
        // }
        // if (isset(this.envCache[name]) || \array_key_exists(name, this.envCache)) {
        //     return this.envCache[name];
        // }
        // if (!this.has(id = 'container.env_var_processors_locator')) {
        //     this.set(id, new ServiceLocator([]));
        // }
        // if (!this.getEnv) {
        //     this.getEnv = \Closure::fromCallable([this, 'getEnv']);
        // }
        // processors = this.get(id);
        // if (false !== i = strpos(name, ':')) {
        //     prefix = substr(name, 0, i);
        //     localName = substr(name, 1 + i);
        // } else {
        //     prefix = 'string';
        //     localName = name;
        // }
        // processor = processors.has(prefix) ? processors.get(prefix) : new EnvVarProcessor(this);
        // this.resolving[envName] = true;
        // try {
        //     return this.envCache[name] = processor.getEnv(prefix, localName, this.getEnv);
        // } finally {
        //     unset(this.resolving[envName]);
        // }
    }
    /**
     * @param string|false registry
     * @param string|bool  load
     *
     * @return mixed
     *
     * @internal
     */
    getService(registry, id, method = null, load = null) {
        var _a, _b, _c, _d;
        var factory;
        if ('service_container' === id) {
            return this;
        }
        if ((typeof load === 'string')) {
            throw new RuntimeException(load);
        }
        if (null === method) {
            return (false !== registry) ? (_a = this[registry][id]) !== null && _a !== void 0 ? _a : null : null;
        }
        if (false !== registry) {
            if (null == method)
                throw new RuntimeException();
            return (_b = this[registry][id]) !== null && _b !== void 0 ? _b : (this[registry][id] = load ? this.load(method) : this[method]());
        }
        if (!load) {
            return this[method]();
        }
        return (factory = (_d = (_c = this.factories[id]) !== null && _c !== void 0 ? _c : this.factories['service_container'][id]) !== null && _d !== void 0 ? _d : null) ? factory() : this.load(method);
    }
    __clone() {
    }
}
exports.Container = Container;
exports.default = Container;
