"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityTaggedService = void 0;
const TaggedIteratorArgument_1 = require("../Argument/TaggedIteratorArgument");
const Container_1 = require("../Container");
const Reference_1 = require("../Reference");
const TypedReference_1 = require("../TypedReference");
class PriorityTaggedService {
    /**
     * Finds all services with the given tag name and order them by their priority.
     *
     * The order of additions must be respected for services having the same priority,
     * and knowing that the \SplPriorityQueue class does not respect the FIFO method,
     * we should not use that class.
     *
     * @see https://bugs.php.net/53710
     * @see https://bugs.php.net/60926
     *
     * @param string|TaggedIteratorArgument tagName
     *
     * @return Reference[]
     */
    findAndSortTaggedServices(tagName, container) {
        var _a, _b, _c, _d;
        var indexAttribute, defaultIndexMethod, needsIndexes = false, defaultPriorityMethod = null;
        if (tagName instanceof TaggedIteratorArgument_1.TaggedIteratorArgument) {
            indexAttribute = tagName.getIndexAttribute();
            defaultIndexMethod = tagName.getDefaultIndexMethod();
            needsIndexes = tagName.needsIndexes();
            defaultPriorityMethod = (_a = tagName.getDefaultPriorityMethod()) !== null && _a !== void 0 ? _a : 'getDefaultPriority';
            tagName = tagName.getTag();
        }
        var i = 0;
        var services = [];
        const baseServices = container.findTaggedServiceIds(tagName, true);
        level_1: for (const serviceId in baseServices) {
            const attributes = baseServices[serviceId];
            var defaultPriority = null;
            var defaultIndex = null;
            var definition = container.getDefinition(serviceId);
            var serviceClass = definition.getClass();
            serviceClass = (_b = container.getParameterBag().resolveValue(serviceClass)) !== null && _b !== void 0 ? _b : null;
            // var checkTaggedItem = !definition.hasTag(80000 <= \PHP_VERSION_ID && definition.isAutoconfigured() ? 'container.ignore_attributes' : tagName);
            var checkTaggedItem = !definition.hasTag(definition.isAutoconfigured() ? 'container.ignore_attributes' : tagName);
            for (const attribute of attributes) {
                var index = null, priority = null;
                if ('priority' in attribute) {
                    priority = attribute.priority;
                }
                else if (null === defaultPriority && defaultPriorityMethod && serviceClass) {
                    defaultPriority = PriorityTaggedServiceUtil.getDefault(container, serviceId, serviceClass, defaultPriorityMethod, tagName, 'priority', checkTaggedItem);
                }
                priority = (_c = priority !== null && priority !== void 0 ? priority : defaultPriority) !== null && _c !== void 0 ? _c : (defaultPriority = 0);
                if (null === indexAttribute && !defaultIndexMethod && !needsIndexes) {
                    services.push([priority, ++i, null, serviceId, null]);
                    continue level_1;
                }
                if (null !== indexAttribute && indexAttribute in attribute) {
                    index = attribute[indexAttribute];
                }
                else if (null === defaultIndex && defaultPriorityMethod && serviceClass) {
                    defaultIndex = PriorityTaggedServiceUtil.getDefault(container, serviceId, serviceClass, defaultIndexMethod !== null && defaultIndexMethod !== void 0 ? defaultIndexMethod : 'getDefaultName', tagName, indexAttribute, checkTaggedItem);
                }
                index = (_d = index !== null && index !== void 0 ? index : defaultIndex) !== null && _d !== void 0 ? _d : (defaultIndex = serviceId);
                services.push([priority, ++i, index, serviceId, serviceClass]);
            }
        }
        // uasort(services, static  (a, b) { return b[0] <=> a[0] ?: a[1] <=> b[1]; });
        services.sort(function (a, b) {
            if (b[0] > a[0])
                return 1;
            if (a[0] > b[0])
                return -1;
            if (a[1] > b[1])
                return 1;
            if (b[1] > a[1])
                return -1;
            return 0;
        });
        var refs = [];
        for (const i in services) {
            const service = services[i];
            var index = service[2];
            var serviceId = service[3];
            serviceClass = service[4];
            if (!serviceClass) {
                var reference = new Reference_1.Reference(serviceId);
            }
            else if (index === serviceId) {
                reference = new TypedReference_1.TypedReference(serviceId, serviceClass);
            }
            else {
                reference = new TypedReference_1.TypedReference(serviceId, serviceClass, Container_1.InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE, index);
            }
            if (null === index) {
                refs.push(reference);
            }
            else {
                refs[index] = reference;
            }
        }
        return refs;
    }
}
exports.PriorityTaggedService = PriorityTaggedService;
/**
 * @internal
 */
class PriorityTaggedServiceUtil {
    /**
     * @return string|int|null
     */
    static getDefault(container, serviceId, serviceClass, defaultMethod, tagName, indexAttribute, checkTaggedItem) {
        return null;
        // var r: any;
        // if (!(r = container.getReflectionClass(serviceClass)) || (!checkTaggedItem && !r.hasMethod(defaultMethod))) {
        //     return null;
        // }
        // if (checkTaggedItem && !r.hasMethod(defaultMethod)) {
        //     foreach (r.getAttributes(AsTaggedItem::class) as attribute) {
        //         return 'priority' === indexAttribute ? attribute.newInstance().priority : attribute.newInstance().index;
        //     }
        //     return null;
        // }
        // var message: string[] = [];
        // if (null !== indexAttribute) {
        //     var service = serviceClass !== serviceId ? sprintf('service "%s"', serviceId) : 'on the corresponding service';
        //     message = [sprintf('Either method "%s::%s()" should ', serviceClass, defaultMethod), sprintf(' or tag "%s" on %s is missing attribute "%s".', tagName, service, indexAttribute)];
        // } else {
        //     message = [sprintf('Method "%s::%s()" should ', serviceClass, defaultMethod), '.'];
        // }
        // if (!(rm = r.getMethod(defaultMethod)).isStatic()) {
        //     throw new InvalidArgumentException(implode('be static', message));
        // }
        // if (!rm.isPublic()) {
        //     throw new InvalidArgumentException(implode('be public', message));
        // }
        // var _default = rm.invoke(null);
        // if ('priority' === indexAttribute) {
        //     if (!\is_int(default)) {
        //         throw new InvalidArgumentException(implode(sprintf('return int (got "%s")', get_debug_type(default)), message));
        //     }
        //     return default;
        // }
        // if (\is_int(default)) {
        //     default = (string) default;
        // }
        // if (!\is_string(default)) {
        //     throw new InvalidArgumentException(implode(sprintf('return string|int (got "%s")', get_debug_type(default)), message));
        // }
        // return default;
    }
}
exports.default = PriorityTaggedService;
