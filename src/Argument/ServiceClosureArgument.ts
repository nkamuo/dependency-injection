import { InvalidArgumentException } from "../Container";
import { Reference } from "../Reference";
import { Argument } from "./Argument";

export class ServiceClosureArgument extends Argument<Reference>
{
    private values: Reference[] = [];

    private method?: string;

    public  constructor(reference: Reference, method?: string)
    {
        super();
        this.values = [reference];
        this.method = method;
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
    public  setValues(values: Reference[], method?: string)
    {
        if ((values.length !== 1 || [undefined,null].includes(<any>values[0]) ) || !(values[0] instanceof Reference || null === values[0])) {
            throw new InvalidArgumentException('A ServiceClosureArgument must hold one and only one Reference.');
        }

        this.values = values;

        if(method)
            this.setMethod(method);
    }

    public getMethod(){
        return this.method;
    }

    public setMethod(method?: string){
        this.method = method;
    }
}

export default ServiceClosureArgument;