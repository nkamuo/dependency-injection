import { Argument } from "./Argument";

export abstract class AbstractArgument<T> extends Argument<T>
{
    private text: string;
    private context!: string;

    public  constructor(text = '')
    {
        super();
        text = text.replace(/([\.\s]+)$/,'');
        this.text = text.replace(/^([\.\s]+)/,'');
    }

    public  setContext(context: string): void
    {
        this.context = context + ' is abstract' + ('' === this.text ? '' : ': ');
    }

    public  getText(): string
    {
        return this.text;
    }

    public  getTextWithContext(): string
    {
        return this.context + this.text + '.';
    }
}

export default AbstractArgument;
