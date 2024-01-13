import { InvalidArgumentException } from "../Container";
import { Reference } from "../Reference";
import { Argument } from "./Argument";
import { TaggedIteratorArgument } from "./TaggedIteratorArgument";

export class ServiceLocatorArgument extends Argument<Reference>
{
    // use ReferenceSetArgumentTrait;

    private values: Reference[] = [];

    private taggedIteratorArgument: TaggedIteratorArgument = null as any;

    /**
     * @param Reference[]|TaggedIteratorArgument $values
     */
    public constructor(values: any[] = [])
    {
        super();
        if (values instanceof TaggedIteratorArgument) {
            this.taggedIteratorArgument = values;
            this.values = [];
        } else {
            this.setValues(values);
        }
    }


    /**
     * {@inheritdoc}
     */
    public  getValues(): Reference[]
    {
        return this.values;
    }


    /**
     * @param Reference[] values The service references to put in the set
     */
    public  setValues(values: Reference[])
    {
        for(const k in values) {
            const v = values[k];

            if (null !== v && !(v instanceof Reference)) {
                throw new InvalidArgumentException(`A "%s" must hold only Reference instances, "%s" given.`);
            }
        }

        this.values = values;
    }

    
    public getTaggedIteratorArgument(): TaggedIteratorArgument|null
    {
        return this.taggedIteratorArgument;
    }
}


export default ServiceLocatorArgument;