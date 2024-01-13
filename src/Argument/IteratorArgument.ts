import { InvalidArgumentException } from "../Container";
import { Reference } from "../Reference";
import { Argument } from "./Argument";

export class IteratorArgument extends Argument<Reference>{
    private values: Reference[] = [];

    public  constructor(values: Reference[])
    {
        super();
        this.setValues(values);
    }

    /**
     * {@inheritdoc}
     */
    public  getValues()
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
export default IteratorArgument;