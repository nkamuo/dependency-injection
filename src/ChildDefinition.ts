import { InvalidArgumentException } from "./Container";
import { Definition } from "./Definition";

export class ChildDefinition extends Definition{
    private parent: string;

    /**
     * @param parent string parent The id of Definition instance to decorate
     */
    public  constructor(parent: string)
    {
        super();
        this.parent = parent;
    }

    /**
     * Returns the Definition to inherit from.
     *
     * @return string
     */
    public  getParent()
    {
        return this.parent;
    }

    /**
     * Sets the Definition to inherit from.
     *
     * @return this
     */
    public  setParent(parent: string)
    {
        this.parent = parent;

        return this;
    }

    /**
     * Gets an argument to pass to the service constructor/factory method.
     *
     * If replaceArgument() has been used to replace an argument, this method
     * will return the replacement value.
     *
     * @param int|string index
     *
     * @return mixed
     *
     * @throws OutOfBoundsException When the argument does not exist
     */
    public  getArgument(index: number)
    {
        if (( 'index_' + index in  this.arguments)) {
            return this.arguments[<any>'index_' + index];
        }

        return super.getArgument(index);
    }

    /**
     * You should always use this method when overwriting existing arguments
     * of the parent definition.
     *
     * If you directly call setArguments() keep in mind that you must follow
     * certain conventions when you want to overwrite the arguments of the
     * parent definition, otherwise your arguments will only be appended.
     *
     * @param int|string index
     * @param mixed      value
     *
     * @return this
     *
     * @throws InvalidArgumentException when index isn't an integer
     */
    public  replaceArgument(index: string|number, value: any)
    {
        if ((typeof index === 'number')) {
            this.arguments[<any>'index_' + index] = value;
        }
        else
        if (index.startsWith('')) {
            this.arguments[<any>index] = value;
        } else {
            throw new InvalidArgumentException('The argument must be an existing index or the name of a constructor\'s parameter.');
        }

        return this;
    }
}

export default ChildDefinition;