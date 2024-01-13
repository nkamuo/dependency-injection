import { InvalidArgumentException } from "../Container";
import { Reference } from "../Reference";

class ReferenceSetArgumentTrait
{ 
    private values: Reference[] = [];

    public  constructor(reference: Reference)
    {
        this.values = [reference];
    }

    /**
     * {@inheritdoc}
     */
    public  getValues(): any
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
}