import { DefaultParameterBag } from "./DefaultParameterBag";


class LogicException extends Error{};

export class FrozenParameterBag<T> extends DefaultParameterBag<T>
{

     constructor(parameters: {[i:string]: any}  = {})
    {
        super();
        // super.add(parameters);
        for(const key in parameters){

            const value = parameters[key];
            this.parameters.set(key,value);
        }
        this.resolved = true;
    }

    /**
     * {@inheritdoc}
     */
    public clear()
    {
        throw new LogicException('Impossible to call clear() on a frozen ParameterBag.');
    }

    /**
     * {@inheritdoc}
     */
    public add(parameters:  {[i:string]: any})
    {
        throw new LogicException('Impossible to call add() on a frozen ParameterBag.');
    }

    /**
     * {@inheritdoc}
     */
    public set(name: string, value: any): void
    {
        throw new LogicException('Impossible to call set() on a frozen ParameterBag.');
    }

    public remove(name: string): void
    {
        throw new LogicException('Impossible to call remove() on a frozen ParameterBag.');
    }
}

export default FrozenParameterBag;