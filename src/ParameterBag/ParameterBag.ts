/**
 * ParameterBagInterface is the interface implemented by objects that manage service container parameters.
 *
 * @author Fabien Potencier <fabien@symfony.com>
 */
export interface ParameterBag<T>
{
    /**
     * Clears all parameters.
     *
     * @throws LogicException if the ParameterBagInterface cannot be cleared
     */
     clear(): void;

    /**
     * Adds parameters to the service container parameters.
     *
     * @throws LogicException if the parameter cannot be added
     */
     add(parameters:  {[i:string]: T}): void;

    /**
     * Gets the service container parameters.
     *
     * @return array
     */
      all():  {[i: string]: T};

    /**
     * Gets a service container parameter.
     *
     * @return array|bool|string|int|float|\UnitEnum|null
     *
     * @throws ParameterNotFoundException if the parameter is not defined
     */
      get(name: string): T;

    /**
     * Removes a parameter.
     */
      remove(name: string): void;

    /**
     * Sets a service container parameter.
     *
     * @param array|bool|string|int|float|\UnitEnum|null value The parameter value
     *
     * @throws LogicException if the parameter cannot be set
     */
      set(name: string, value: any): void;

    /**
     * Returns true if a parameter name is defined.
     *
     * @return bool
     */
      has(name: string): boolean;

    /**
     * Replaces parameter placeholders (%name%) by their values for all parameters.
     */
      resolve(): void;

    /**
     * Replaces parameter placeholders (%name%) by their values.
     *
     * @param mixed value A value
     *
     * @throws ParameterNotFoundException if a placeholder references a parameter that does not exist
     */
      resolveValue(value: any): any;

    /**
     * Escape parameter placeholders %.
     *
     * @param mixed value
     *
     * @return mixed
     */
      escapeValue(value: any): any;

    /**
     * Unescape parameter placeholders %.
     *
     * @param mixed value
     *
     * @return mixed
     */
      unescapeValue(value: any): any;
}

// export default ParameterBag;