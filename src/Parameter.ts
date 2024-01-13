
export class Parameter
{
    private id: string;

    public  constructor(id: string)
    {
        this.id = id;
    }

    /**
     * @return string
     */
    public toString()
    {
        return this.id;
    }
}

export default Parameter;