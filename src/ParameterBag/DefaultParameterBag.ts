import sprintf from "locutus/php/strings/sprintf";
import { InvalidArgumentException } from "../Container";
import { ParameterBag } from "./ParameterBag";



export class DefaultParameterBag<T> implements ParameterBag<T>{

    protected resolved = false;

    protected parameters = new Map<string,any>();

    public constructor(parameters?: {[i:string]: any}, additional?: any)
    {
        if(parameters)
            this.add(parameters);
    }

    clear(): void {
        this.parameters.clear();
    }

    add(parameters: {[i:string]: any}): void {
        for(var key in parameters)
            this.parameters.set(key,parameters[key]);

    }

    all(): {[i: string]: any} {
        // return JSON.parse(this.parameters.) as  {[i: string]: any};

        const keys = this.parameters.keys();

        const data: {[i:string]: any} = {};
        for(const key of keys){
            data[key] = this.parameters.get(key);
        }

        return data;
    }
    get(name: string) {
        if(!this.parameters.has(name))
            throw new InvalidArgumentException(sprintf(' Parameter "%s" does not exist in container',name));

        return this.parameters.get(name);
    }

    remove(name: string) {
     this.parameters.delete(name);
    }
    set(name: string, value: any) {
         this.parameters.set(name,value);
    }
    has(name: string) {
        return this.parameters.has(name);
    }



    resolve(): void {

        if (this.resolved) {
            return;
        }

        var parameters:any[][] = [];

        // var _parameters = this.parameters.
        
        this.parameters.forEach((value,key) => {
            try {
                value = this.resolveValue(value);
                const resolvedValue = this.unescapeValue(value);

                parameters.push([key,resolvedValue]);
            } catch ( e) {
                //ParameterNotFoundException
                // e.setSourceKey(key);

                throw e;
            }
        });
        
        // this.parameters = new Map(<Iterable<readonly [string, any]>>parameters);

        this.parameters.clear();

        for(const param of parameters)
            this.parameters.set(param[0],param[1]);

        this.resolved = true;
    }


    public resolveValue(value: any, resolving: {[i:string]: any}= {}): any {
        // console.log('input-resolve-value: ', value);

        if (value && (typeof value == 'object' && (value.constructor === Object || value instanceof Array))) {
            var result: any = Array.isArray(value)? [] : {};
            for(var k in value) {
                const v = value[k];

                result[(typeof k == 'string') ? this.resolveValue(k, resolving) : k] = this.resolveValue(v, resolving);
            }

            // console.log('found: ', args);
            
        // console.log('output-resolve-value: ', args);

            return result;
        }

        if (!(typeof value == 'string') || 2 > value.length) {
            // console.log('output-resolve-value: ', value);
            return value;
        }
        
        // console.log('output-resolve-value: ', '[string]');

        return this.resolveString(value, resolving);
    }
 /**
     * Resolves parameters inside a string.
     *
     * @param array resolving An array of keys that are being resolved (used internally to detect circular references)
     *
     * @return mixed
     *
     * @throws ParameterNotFoundException          if a placeholder references a parameter that does not exist
     * @throws ParameterCircularReferenceException if a circular reference if detected
     * @throws RuntimeException                    when a given parameter has a type problem
     */
  public  resolveString(value: string, resolving: {[i:string]: any} = {}): string
  {
      // we do this to deal with non string values (Boolean, integer, ...)
      // as the preg_replace_callback throw an exception when trying
      // a non-string in a parameter value
      const match = value.match(/^%([^%\s]+)%/);

      if (match) {
          const key = match[1];

          if (key in resolving) {

            //   throw new ParameterCircularReferenceException(array_keys(resolving));
            throw new Error("Circular reference in parameters: " + resolving.keys())
          }

          resolving[key] = true;

          return this.resolved ? this.get(key) : this.resolveValue(this.get(key), resolving);
      }

      const _this = this;

      if(!value.match(/%(.+?)%/))
        return value;



      try{

      return value.replace(/%%|%([^%\s]+)%/,  function(allMatched: string ,match: string){
        
        // console.log('Value: ', value, 'match: ', match1);
         
        // skip %%
        //   if ((match[1])) {
        //       return '%%';
        //   }

        //   console.log('input: ', value, 'key: ', match);

          var key = match;
          if (key in resolving) {
            console.log('Circular Reference: ', key);
              throw new Error(resolving.join(', '));
              //ParameterCircularReferenceException
          }

          var resolved: any = _this.get(key);

        //   console.log('resolved: ', resolved);

          if (!(typeof resolved == 'string') && !(typeof resolved == 'number')) {
              throw new Error(`A string value must be composed of strings and/or numbers, but found parameter "%s" of type "%s" inside string value "%s".`);
              //RuntimeException
          }

          resolved = String(resolved);
          resolving[key] = true;

          return _this.isResolved() ? resolved : _this.resolveString(resolved, resolving);
      });

    }
    catch(error){
        console.log('Resolving: ', value);
        console.log(arguments);
        throw error;
    }
  }

  public  isResolved()
  {
      return this.resolved;
  }

  /**
   * {@inheritdoc}
   */
  public  escapeValue(value: any)
  {
      if ((typeof value == 'string')) {
          return value.replace('%', '%%');
      }

      if (value && (typeof value == 'object' && (value.constructor === Object || value instanceof Array))) {
        var result: any = Array.isArray(value)? [] : {};
          for(const k in value) {
            const v = value[k];

              result[k] = this.escapeValue(v);
          }

          return result;
      }

      return value;
  }

  /**
   * {@inheritdoc}
   */
  public  unescapeValue(value: {[i:string]: any}|string|number )
  {
      if ((typeof value == 'string')) {
          return value.replace('%%', '%');
      }

      if (value && (typeof value == 'object' && (value.constructor === Object || value instanceof Array))) {
        var result: any = Array.isArray(value)? [] : {};
          for(var k in value) {
            const v = (value as any)[k];

              result[k] = this.unescapeValue(v);
          }
          
        //   console.log('found-esc: ', result);

          return result;
      }


      return value;
  }
    
}

export default DefaultParameterBag;