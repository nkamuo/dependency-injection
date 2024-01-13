
export class RewindableGenerator// implements IteratorAggregate, \Countable
{
    private generator:  () => Generator<any, void, any>;
    private _count: number|((value: any) => number);

    /**
     * @param int|callable count
     */
    public  constructor(generator: () => Generator<any, void, any>, count?: number|((value: any) => number))
    {
        this.generator = generator;
        this._count = count as any;
    }

    public  getIterator()//: Generator
    {
        const g = this.generator;

        return g();
    }

    public  count(): number
    {
        var count;
        if ( typeof (count = this.count) == 'function') {
            this._count = count();
        }

        return this._count as number;
    }
}


export default RewindableGenerator;