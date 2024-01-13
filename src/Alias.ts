
class RuntimeException extends Error{}
class InvalidArgumentException extends Error{}

export class Alias
{
    private static readonly DEFAULT_DEPRECATION_TEMPLATE = 'The "%alias_id%" service alias is deprecated. You should stop using it, as it will be removed in the future.';

    private id: string;
    private is_public: boolean;
    private deprecation: {[i:string]: any} = {};

    public  constructor(id: string, is_public = false)
    {
        this.id = id;
        this.is_public = is_public;
    }

    /**
     * Checks if this DI Alias should be public or not.
     *
     * @return bool
     */
    public  isPublic(): boolean
    {
        return this.is_public;
    }

    /**
     * Sets if this Alias is public.
     *
     * @return this
     */
    public  setPublic(is_public: boolean): Alias
    {
        this.is_public = is_public;

        return this;
    }

    /**
     * Sets if this Alias is private.
     *
     * @return this
     *
     * @deprecated since Symfony 5.2, use setPublic() instead
     */
    public  setPrivate(is_private: boolean)
    {
        console.warn('symfony/dependency-injection', '5.2', 'The "%s()" method is deprecated, use "setPublic()" instead.', 'Alias::setPrivate');

        return this.setPublic(!is_private);
    }

    /**
     * Whether this alias is private.
     *
     * @return bool
     */
    public  isPrivate()
    {
        return !this.is_public;
    }

    /**
     * Whether this alias is deprecated, that means it should not be referenced
     * anymore.
     *
     * @param string package The name of the composer package that is triggering the deprecation
     * @param string version The version of the package that introduced the deprecation
     * @param string message The deprecation message to use
     *
     * @return this
     *
     * @throws InvalidArgumentException when the message template is invalid
     */
    public  setDeprecated(..._args: any[])
    {
        var status: any;

        const args = Array.from(arguments);

        if (args.length < 3) {
            console.warn('symfony/dependency-injection', '5.1', 'The signature of method "%s()" requires 3 arguments: "string package, string version, string message", not defining them is deprecated.', 'Alias:setDeprcated');

            status = args[0] ?? true;

            if (!status) {
                console.warn('raegon/dependency-injection', '5.1', 'Passing a null message to un-deprecate a node is deprecated.');
            }

            var message = String(args[1] ?? null);

            var _package,version = '';
        } else {
            status = true;
            _package = String(args[0]);
            version = String(args[1]);
            message = String(args[2]);
        }

        if ('' !== message) {
            if (message.match(/[\r\n]|\*/)) {
                throw new InvalidArgumentException('Invalid characters found in deprecation template.');
            }

            if (message.indexOf('%alias_id%') == -1) {
                throw new InvalidArgumentException('The deprecation template must contain the "%alias_id%" placeholder.');
            }
        }

        this.deprecation = status ? {'package' : _package, 'version' : version, 'message' : message ?? Alias.DEFAULT_DEPRECATION_TEMPLATE }
        :
        {};

        return this;
    }

    public  isDeprecated(): boolean
    {
        return Boolean(this.deprecation);
    }

    /**
     * @deprecated since Symfony 5.1, use "getDeprecation()" instead.
     */
    public  getDeprecationMessage(id: string): string
    {
        console.warn('symfony/dependency-injection', '5.1', 'The "%s()" method is deprecated, use "getDeprecation()" instead.', 'Alias::getDepricationMessage()');

        return this.getDeprecation(id)['message'];
    }

    /**
     * @param string id Service id relying on this definition
     */
    public  getDeprecation(id: string): {[i:string]: any}
    {
        return {
            'package' : this.deprecation['package'],
            'version' : this.deprecation['version'],
            'message' : this.deprecation['message']?.replace('%alias_id%', id),
        };
    }

    /**
     * Returns the Id of this alias.
     *
     * @return string
     */
    public toString()
    {
        return this.id;
    }
}
export default Alias;
