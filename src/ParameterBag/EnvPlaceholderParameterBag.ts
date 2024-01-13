import sprintf from "locutus/php/strings/sprintf";
import strtr from "locutus/php/strings/strtr";
import { InvalidArgumentException, RuntimeException } from "../Container";
import { DefaultParameterBag } from "./DefaultParameterBag";

export class EnvPlaceholderParameterBag<T> extends DefaultParameterBag<T>{

    private envPlaceholderUniquePrefix: string = null as any;
    private envPlaceholders:{[i: string]: {[i:string]: any}} = {};
    private unusedEnvPlaceholders: {[i:string]: any} = {};
    private providedTypes: {[i:string]: any} = {};

    private static counter = 0;

    /**
     * {@inheritdoc}
     */
    public get(name: string)
    {
        // console.info('resolving: ', name);

        if (name.startsWith('env(') && name.endsWith(')') && 'env()' != name) {
            var env = name.substring( 4, -1);

            if ((env in this.envPlaceholders)) {
                for(const index in this.envPlaceholders[env]) {
                    const placeholder = this.envPlaceholders[env][index];
                    return placeholder; // return first result
                }
            }
            else{
                this.envPlaceholders[env] = {};
            }
            if (( env in this.unusedEnvPlaceholders)) {
                for(const index in this.unusedEnvPlaceholders[env]) {
                    const placeholder = this.unusedEnvPlaceholders[env][index];
                    return placeholder; // return first result
                }
            }
            if (!/^(?:[-.\w]*:)*\w+/.test (env)) {
                throw new InvalidArgumentException(sprintf('Invalid %s name: only "word" characters are allowed.', name));
            }
            var defaultValue: any;

            if (this.has(name) && null !== (defaultValue = super.get(name)) && !(typeof defaultValue == 'string')) {
                throw new RuntimeException(sprintf('The default value of an env() parameter must be a string or null, but "%s" given to "%s".', typeof(defaultValue), name));
            }

            // const uniqueName = (JSON.stringify(name + '_' + EnvPlaceholderParameterBag.counter++));//md5(name.'_'.self::counter++);
           const uniqueName = encodeURI(name + '_' + EnvPlaceholderParameterBag.counter++);
            const placeholder = sprintf('%s_%s_%s', this.getEnvPlaceholderUniquePrefix(), strtr(env, ':-.', '___'), uniqueName);
            
            this.envPlaceholders[env][placeholder] = placeholder;

            return placeholder;
        }


        // if (str_starts_with(name, 'env(') && str_ends_with(name, ')') && 'env()' !== name) {
        //     env = substr(name, 4, -1);

        //     if (isset(this.envPlaceholders[env])) {
        //         foreach (this.envPlaceholders[env] as placeholder) {
        //             return placeholder; // return first result
        //         }
        //     }
        //     if (isset(this.unusedEnvPlaceholders[env])) {
        //         foreach (this.unusedEnvPlaceholders[env] as placeholder) {
        //             return placeholder; // return first result
        //         }
        //     }
        //     if (!preg_match('/^(?:[-.\w]*+:)*+\w++/', env)) {
        //         throw new InvalidArgumentException(sprintf('Invalid %s name: only "word" characters are allowed.', name));
        //     }
        //     if (this.has(name) && null !== (defaultValue = parent::get(name)) && !\is_string(defaultValue)) {
        //         throw new RuntimeException(sprintf('The default value of an env() parameter must be a string or null, but "%s" given to "%s".', get_debug_type(defaultValue), name));
        //     }

        //     uniqueName = md5(name.'_'.self::counter++);
        //     placeholder = sprintf('%s_%s_%s', this.getEnvPlaceholderUniquePrefix(), strtr(env, ':-.', '___'), uniqueName);
        //     this.envPlaceholders[env][placeholder] = placeholder;

        //     return placeholder;
        // }

        return super.get(name);
    }

    /**
     * Gets the common env placeholder prefix for env vars created by this bag.
     */
    public  getEnvPlaceholderUniquePrefix(): string
    {
        // if (null === this.envPlaceholderUniquePrefix) {
        //     reproducibleEntropy = unserialize(serialize(this.parameters));
        //     array_walk_recursive(reproducibleEntropy,  (&v) { v = null; });
        //     this.envPlaceholderUniquePrefix = 'env_'.substr(md5(serialize(reproducibleEntropy)), -16);
        // }

        return this.envPlaceholderUniquePrefix;
    }

    /**
     * Returns the map of env vars used in the resolved parameter values to their placeholders.
     *
     * @return string[][] A map of env var names to their placeholders
     */
    public  getEnvPlaceholders()
    {
        return this.envPlaceholders;
    }

    public  getUnusedEnvPlaceholders()
    {
        return this.unusedEnvPlaceholders;
    }

    public  clearUnusedEnvPlaceholders()
    {
        this.unusedEnvPlaceholders = [];
    }

    /**
     * Merges the env placeholders of another EnvPlaceholderParameterBag.
     */
    public  mergeEnvPlaceholders(bag: EnvPlaceholderParameterBag<T>)
    {
        var newPlaceholders: {[i:string]: any};
        var newUnusedPlaceholders: {[i:string]: any};

        if (newPlaceholders = bag.getEnvPlaceholders()) {
            Object.assign(this.envPlaceholders,newPlaceholders);

            for(const env in newPlaceholders) {
                const placeholders = newPlaceholders[env];

                this.envPlaceholders[env] += placeholders;
            }
        }

        if (newUnusedPlaceholders = bag.getUnusedEnvPlaceholders()) {
            Object.assign(this.unusedEnvPlaceholders,newUnusedPlaceholders);

            for(const env in newUnusedPlaceholders) {
                const placeholders = newPlaceholders[env];
                this.unusedEnvPlaceholders[env] += placeholders;
            }
        }
    }

    /**
     * Maps env prefixes to their corresponding PHP types.
     */
    public  setProvidedTypes(providedTypes: {[i:string]: any})
    {
        this.providedTypes = providedTypes;
    }

    /**
     * Gets the PHP types corresponding to env() parameter prefixes.
     *
     * @return string[][]
     */
    public  getProvidedTypes()
    {
        return this.providedTypes;
    }

    /**
     * {@inheritdoc}
     */
    public  resolve()
    {
        if (this.resolved) {
            return;
        }
        super.resolve();

        for(const env in this.envPlaceholders) {
            const placeholders = this.envPlaceholders[env];
            var name: string;
            var _default: any;
            
            if (this.has(name = "env(env)") && null !== (_default = this.parameters.get(name)) && !(typeof _default == 'string')) {
                throw new RuntimeException(`The default value of env parameter "{env}" must be a string or null, "{typeof _default}" given.`);
            }
        }
    }

    //  /**
    //  * Merges the env placeholders of another EnvPlaceholderParameterBag.
    //  */
    //   public mergeEnvPlaceholders(bag: EnvPlaceholderParameterBag)
    //   {
        
    //       var newPlaceholders: any;

    //       if (newPlaceholders = bag.getEnvPlaceholders()) {
    //           this.envPlaceholders += newPlaceholders;
  
    //           for(const env in newPlaceholders) {
    //             const placeholders = newPlaceholders[env];

    //             this.envPlaceholders[env] += placeholders;
    //           }
    //       }

    //       var newUnusedPlaceholders: any;
  
    //       if (newUnusedPlaceholders = bag.getUnusedEnvPlaceholders()) {
    //           this.unusedEnvPlaceholders += newUnusedPlaceholders;
  
    //           for(const env in newUnusedPlaceholders) {
    //             const placeholders = newUnusedPlaceholders[env];
    //               this.unusedEnvPlaceholders[env] += placeholders;
    //           }
    //       }
    //   }
}

export default EnvPlaceholderParameterBag;