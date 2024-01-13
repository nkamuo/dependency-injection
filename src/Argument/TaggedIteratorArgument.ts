import { IteratorArgument } from "./IteratorArgument";

/**
 * Represents a collection of services found by tag name to lazily iterate over.
 *
 * @author Roland Franssen <franssen.roland@gmail.com>
 */
export class TaggedIteratorArgument extends IteratorArgument
{
    private tag: string;
    private indexAttribute: string;
    private defaultIndexMethod: string;
    private defaultPriorityMethod: string;
    private _needsIndexes = false;

    /**
     * @param string      tag                   The name of the tag identifying the target services
     * @param string|null indexAttribute        The name of the attribute that defines the key referencing each service in the tagged collection
     * @param string|null defaultIndexMethod    The static method that should be called to get each service's key when their tag doesn't define the previous attribute
     * @param bool        needsIndexes          Whether indexes are required and should be generated when computing the map
     * @param string|null defaultPriorityMethod The static method that should be called to get each service's priority when their tag doesn't define the "priority" attribute
     */
    public  constructor(tag: string,indexAttribute: string = null as any, defaultIndexMethod: string = null as any,needsIndexes = false, defaultPriorityMethod: string = null as any)
    {
        super([]);

        if (null === indexAttribute && needsIndexes) {
            // indexAttribute = preg_match('/[^.]++/', tag, m) ? m[0] : tag;
            // var indexAttribute;?
            const matches = tag.match(/[^.]+/);
            if(matches){
                indexAttribute = matches[0];
            }
        }

        this.tag = tag;
        this.indexAttribute = indexAttribute;
        this.defaultIndexMethod = defaultIndexMethod ??
        (indexAttribute ? 'getDefault'+ indexAttribute.replace('/[^a-zA-Z0-9\x7f-\xff]++/', ' ').toLocaleUpperCase().replace(' ','') + 'Name' : null);
        this._needsIndexes = needsIndexes;
        this.defaultPriorityMethod = defaultPriorityMethod ?? (indexAttribute ? 'getDefault' + indexAttribute.replace('/[^a-zA-Z0-9\x7f-\xff]++/', ' ').toLocaleUpperCase().replace(' ','') + 'Priority' : null);
    }

    public  getTag()
    {
        return this.tag;
    }

    public  getIndexAttribute(): string|null
    {
        return this.indexAttribute;
    }

    public  getDefaultIndexMethod(): string|null
    {
        return this.defaultIndexMethod;
    }

    public  needsIndexes(): boolean
    {
        return this._needsIndexes;
    }

    public  getDefaultPriorityMethod(): string|null
    {
        return this.defaultPriorityMethod;
    }
}


export default TaggedIteratorArgument;