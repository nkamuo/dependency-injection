import { InvalidServiceBehavior } from './Container';

export class Reference {
    public id: string;
    public invalidBehavior: InvalidServiceBehavior;

    constructor(id: string, invalidBehavior =  InvalidServiceBehavior.EXCEPTION_ON_INVALID_REFERENCE) {
        this.id = id;
        this.invalidBehavior = invalidBehavior;
    }

    public getId(){
        return this.id;
    }

    public getInvalidBehavior(){
        return this.invalidBehavior;
    }

    public  toString(){
        return this.getId();
    }
}


export default Reference;