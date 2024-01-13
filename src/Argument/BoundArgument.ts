import { Argument } from "./Argument";

export class BoundArgument extends Argument<any>
{
    public static readonly SERVICE_BINDING = 0;
    public static readonly DEFAULTS_BINDING = 1;
    public static readonly INSTANCEOF_BINDING = 2;

    private static sequence = 0;

    private value: any[];
    private identifier!: number;
    private used: boolean = false;
    private type: number;
    private file: string;

    public  constructor(value: any, trackUsage = true, type = 0, file: string = null as any)
    {
        super()
        this.value = value;
        if (trackUsage) {
            this.identifier = ++BoundArgument.sequence;
        } else {
            this.used = true;
        }
        this.type = type;
        this.file = file;
    }

    /**
     * {@inheritdoc}
     */
    public  getValues(): any[]
    {
        return [this.value, this.identifier, this.used, this.type, this.file];
    }

    /**
     * {@inheritdoc}
     */
    public  setValues(values: any[])
    {
        if (5 === values.length) {
            [this.value, this.identifier, this.used, this.type, this.file] = values;
        } else {
            [this.value, this.identifier, this.used] = values;
        }
    }
}
export default BoundArgument;