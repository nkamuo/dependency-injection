import { InvalidServiceBehavior } from './Container';
import { Reference } from './Reference';


export class TypedReference extends Reference {

    public type: any;

    public name: string;

    constructor(
        id: string,
        type: any,
        invalidBehavior =  InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE,
        name: string = null as any,
        ) {
        super(id, invalidBehavior);

        this.type = type;
        this.name = name;
    }

    public getType(){
        return this.type;
    }

}

export default TypedReference;