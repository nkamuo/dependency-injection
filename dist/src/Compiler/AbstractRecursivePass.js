"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRecursivePass = void 0;
const Argument_1 = require("../Argument/Argument");
const Definition_1 = require("../Definition");
// console.log('ExpressionLanguage: ',ExpressionLanguage);
class AbstractRecursivePass {
    constructor() {
        /**
         * @var ContainerBuilder
         */
        this.container = null;
        this.currentId = null;
        this.processExpressions = false;
        // private expressionLanguage: ExpressionLanguage = null as any;
        this._inExpression = false;
        // /**
        //  * @return \ReflectionAbstract|null
        //  *
        //  * @throws RuntimeException
        //  */
        // protected  getConstructor(definition: Definition, required: boolean)
        // {
        //     var global_object = window?? self;
        // if (definition.isSynthetic()) {
        //     return null;
        // }
        // var factory: any;
        // if ( typeof  (factory = definition.getFactory()) == 'string') {
        //     if (!(factory in global_object)) {
        //         throw new RuntimeException(sprintf('Invalid service "%s":  "%s" does not exist.', this.currentId, factory));
        //     }
        //     // r = new \Reflection(factory);
        //     // if (false !== r.getFileName() && file_exists(r.getFileName())) {
        //     //     this.container.fileExists(r.getFileName());
        //     // }
        //     // return r;
        // }
        // if (factory) {
        //     [class, method] = factory;
        //     if ('__construct' === method) {
        //         throw new RuntimeException(sprintf('Invalid service "%s": "__construct()" cannot be used as a factory method.', this.currentId));
        //     }
        //     if (class instanceof Reference) {
        //         factoryDefinition = this.container.findDefinition((string) class);
        //         while ((null === class = factoryDefinition.getClass()) && factoryDefinition instanceof ChildDefinition) {
        //             factoryDefinition = this.container.findDefinition(factoryDefinition.getParent());
        //         }
        //     } elseif (class instanceof Definition) {
        //         class = class.getClass();
        //     } elseif (null === class) {
        //         class = definition.getClass();
        //     }
        //     return this.getReflectionMethod(new Definition(class), method);
        // }
        // while ((null === class = definition.getClass()) && definition instanceof ChildDefinition) {
        //     definition = this.container.findDefinition(definition.getParent());
        // }
        // try {
        //     if (!r = this.container.getReflectionClass(class)) {
        //         if (null === class) {
        //             throw new RuntimeException(sprintf('Invalid service "%s": the class is not set.', this.currentId));
        //         }
        //         throw new RuntimeException(sprintf('Invalid service "%s": class "%s" does not exist.', this.currentId, class));
        //     }
        // } catch (\ReflectionException e) {
        //     throw new RuntimeException(sprintf('Invalid service "%s": ', this.currentId).lcfirst(e.getMessage()));
        // }
        // if (!r = r.getConstructor()) {
        //     if (required) {
        //         throw new RuntimeException(sprintf('Invalid service "%s": class%s has no constructor.', this.currentId, sprintf(class !== this.currentId ? ' "%s"' : '', class)));
        //     }
        // } elseif (!r.isPublic()) {
        //     throw new RuntimeException(sprintf('Invalid service "%s": ', this.currentId).sprintf(class !== this.currentId ? 'constructor of class "%s"' : 'its constructor', class).' must be public.');
        // }
        // return r;
        // }
        // /**
        //  * @throws RuntimeException
        //  *
        //  * @return \ReflectionAbstract
        //  */
        // protected  getReflectionMethod( definition, string method)
        // {
        //     if ('__construct' === method) {
        //         return this.getConstructor(definition, true);
        //     }
        //     while ((null === class = definition.getClass()) && definition instanceof ChildDefinition) {
        //         definition = this.container.findDefinition(definition.getParent());
        //     }
        //     if (null === class) {
        //         throw new RuntimeException(sprintf('Invalid service "%s": the class is not set.', this.currentId));
        //     }
        //     if (!r = this.container.getReflectionClass(class)) {
        //         throw new RuntimeException(sprintf('Invalid service "%s": class "%s" does not exist.', this.currentId, class));
        //     }
        //     if (!r.hasMethod(method)) {
        //         if (r.hasMethod('__call') && (r = r.getMethod('__call')) && r.isPublic()) {
        //             return new \ReflectionMethod(static  (...arguments) {}, '__invoke');
        //         }
        //         throw new RuntimeException(sprintf('Invalid service "%s": method "%s()" does not exist.', this.currentId, class !== this.currentId ? class.'::'.method : method));
        //     }
        //     r = r.getMethod(method);
        //     if (!r.isPublic()) {
        //         throw new RuntimeException(sprintf('Invalid service "%s": method "%s()" must be public.', this.currentId, class !== this.currentId ? class.'::'.method : method));
        //     }
        //     return r;
        // }
        // private  getExpressionLanguage(): ExpressionLanguage
        // {
        //     if (null === this.expressionLanguage) {
        //         // if (!class_exists(ExpressionLanguage::class)) {
        //         //     throw new LogicException('Unable to use expressions as the Symfony ExpressionLanguage component is not installed. Try running "composer require symfony/expression-language".');
        //         // }
        //         const providers = this.container.getExpressionLanguageProviders();
        //         this.expressionLanguage = new ExpressionLanguage();
        //         // this.expressionLanguage = new ExpressionLanguage(null, providers,  function(string arg): string {
        //         //     if ('""' === substr_replace(arg, '', 1, -1)) {
        //         //         id = stripcslashes(substr(arg, 1, -1));
        //         //         this.inExpression = true;
        //         //         arg = this.processValue(new Reference(id));
        //         //         this.inExpression = false;
        //         //         if (!arg instanceof Reference) {
        //         //             throw new RuntimeException(sprintf('"%s::processValue()" must return a Reference when processing an expression, "%s" returned for service("%s").', static::class, get_debug_type(arg), id));
        //         //         }
        //         //         arg = sprintf('"%s"', arg);
        //         //     }
        //         //     return sprintf('this.get(%s)', arg);
        //         // });
        //     }
        //     return this.expressionLanguage;
        // }
    }
    /**
     * {@inheritdoc}
     */
    process(container) {
        this.container = container;
        try {
            this.processValue(container.getDefinitions(), true);
        }
        finally {
            this.container = null;
        }
    }
    enableExpressionProcessing() {
        this.processExpressions = true;
    }
    inExpression(reset = true) {
        var _inExpression = this._inExpression;
        if (reset) {
            this._inExpression = false;
        }
        return _inExpression;
    }
    /**
     * Processes a value found in a definition tree.
     *
     * @param mixed value
     *
     * @return mixed
     */
    processValue(value, isRoot = false) {
        //ATTENSTION
        if ((typeof value === 'object') && ((value != null && value.constructor === Object) || Array.isArray(value))) {
            // console.log('recursive-in: ', value);
            // return value;
            for (const k in value) {
                var processedValue = null;
                const v = value[k];
                if (isRoot) {
                    this.currentId = k;
                }
                if (v !== (processedValue = this.processValue(v, isRoot))) {
                    value[k] = processedValue;
                }
            }
            // console.log('recursive-out: ', value);
        }
        else if (value instanceof Argument_1.Argument) {
            value.setValues(this.processValue(value.getValues()));
        }
        // else
        // if (value instanceof Expression && this.processExpressions) {
        //     this.getExpressionLanguage().compile((string) value, ['this' => 'container']);
        // }
        else if (value instanceof Definition_1.Definition) {
            var mCalls;
            // console.log('method calls orig: ', value.getMethodCalls());
            mCalls = this.processValue(value.getMethodCalls());
            // console.log('method calls modified: ', mCalls);
            value.setArguments(this.processValue(value.getArguments()));
            value.setProperties(this.processValue(value.getProperties()));
            value.setMethodCalls(mCalls = this.processValue(value.getMethodCalls()));
            // console.log('method calls: ', value.getMethodCalls());
            const changes = value.getChanges();
            if (('factory' in changes)) {
                value.setFactory(this.processValue(value.getFactory()));
            }
            if ('configurator' in changes) {
                value.setConfigurator(this.processValue(value.getConfigurator()));
            }
        }
        // console.log('recursive-out: ', value);
        return value;
    }
}
exports.AbstractRecursivePass = AbstractRecursivePass;
