import { TaggedIteratorArgument } from "../Argument/TaggedIteratorArgument";
import { InvalidArgumentException, InvalidServiceBehavior } from "../Container";
import { ContainerBuilder } from "../ContainerBuilder";
import { Reference } from "../Reference";
import { TypedReference } from "../TypedReference";
import sprintf from 'locutus/php/strings/sprintf';

export class PriorityTaggedService
{
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
    public  findAndSortTaggedServices(tagName: string|object,container: ContainerBuilder): Reference[]
    {
        var indexAttribute!: string|null, defaultIndexMethod!: string|null, needsIndexes = false, defaultPriorityMethod: any = null as any;

        if (tagName instanceof TaggedIteratorArgument) {
            indexAttribute = tagName.getIndexAttribute();
            defaultIndexMethod = tagName.getDefaultIndexMethod();
            needsIndexes = tagName.needsIndexes();
            defaultPriorityMethod = tagName.getDefaultPriorityMethod() ?? 'getDefaultPriority';
            tagName = tagName.getTag();
        }

        var i = 0;
        var services :any[] = [];

        const baseServices = container.findTaggedServiceIds(<string>tagName, true);

        level_1: for(const serviceId in baseServices) {
            const attributes = baseServices[serviceId];

            var defaultPriority: number|null = null as any;
            var defaultIndex: number|null = null as any;
            var definition = container.getDefinition(serviceId);

            var serviceClass = definition.getClass();
            serviceClass = container.getParameterBag().resolveValue(serviceClass) ?? null;

            // var checkTaggedItem = !definition.hasTag(80000 <= \PHP_VERSION_ID && definition.isAutoconfigured() ? 'container.ignore_attributes' : tagName);

            var checkTaggedItem = !definition.hasTag(definition.isAutoconfigured() ? 'container.ignore_attributes' : <string>tagName);

            for(const attribute of attributes) {
                var index: any = null, priority = <number><any>null;

                if ('priority' in attribute) {
                    priority = attribute.priority;

                }
                else
                    if (null === defaultPriority && defaultPriorityMethod && serviceClass) {
                    defaultPriority = PriorityTaggedServiceUtil.getDefault(container, serviceId, serviceClass, defaultPriorityMethod, <string>tagName, 'priority', checkTaggedItem);
                }
                priority = priority ?? defaultPriority ?? (defaultPriority = 0);

                if (null === indexAttribute && ! defaultIndexMethod && !needsIndexes) {
                    services.push([priority, ++i, null, serviceId, null]);
                    continue level_1;
                }

                if (null !== indexAttribute &&  indexAttribute in attribute) {
                    index = attribute[indexAttribute];
                } else
                    if (null === defaultIndex && defaultPriorityMethod && serviceClass) {
                    defaultIndex = PriorityTaggedServiceUtil.getDefault(container, serviceId, serviceClass, defaultIndexMethod ?? 'getDefaultName', <string>tagName, <string>indexAttribute, checkTaggedItem);
                }
                index = index ?? defaultIndex ?? (defaultIndex = <any>serviceId);

                services.push([priority, ++i, index, serviceId, serviceClass]);
            }
        }

        // uasort(services, static  (a, b) { return b[0] <=> a[0] ?: a[1] <=> b[1]; });
        services.sort(function(a, b) {

            if(b[0] > a[0])
                return 1;
            if(a[0] > b[0])
                return -1;
            if(a[1] > b[1])
                return 1;
            if(b[1] > a[1])
                return -1;
            return 0;
        });

        var refs: Reference[] = [];
        for(const i in services) {
            const service = services[i];

            var index = service[2];
            var serviceId = service[3];
            serviceClass = service[4];

            if (!serviceClass) {
                var reference = new Reference(serviceId);
            } 
            else
            if (index === serviceId) {
                reference = new TypedReference(serviceId, serviceClass);
            } else {
                reference = new TypedReference(serviceId, serviceClass, InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE, index);
            }

            if (null === index) {
                refs.push(reference);
            } else {
                refs[index] = reference;
            }
        }

        return refs;
    }
}

/**
 * @internal
 */
class PriorityTaggedServiceUtil
{
    /**
     * @return string|int|null
     */
    public static  getDefault(container: ContainerBuilder,serviceId: string, serviceClass: any,defaultMethod: string, tagName: string, indexAttribute?:  string, checkTaggedItem?: boolean)
    {

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


export default PriorityTaggedService;