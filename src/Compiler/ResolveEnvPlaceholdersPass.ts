// import AbstractRecursivePass from './AbstractRecursivePass';

import { Definition } from "../Definition";
import { AbstractRecursivePass } from "./AbstractRecursivePass";

export class ResolveEnvPlaceholdersPass extends AbstractRecursivePass
{
    protected  processValue(value: any, isRoot: boolean = false)
    {
        // return value;
        // console.log('proccessing: ', value);
        const originalValue = value;

        if ((typeof value == 'string')) {
            return this.container.resolveEnvPlaceholders(value, true);
        }
        if (value instanceof Definition) {
            const changes = value.getChanges();
            if (('service_class' in changes)) {
                value.setClass(this.container.resolveEnvPlaceholders(value.getClass(), true));
            }
            if ( 'file' in changes) {
                value.setFile(this.container.resolveEnvPlaceholders(value.getFile(), true));
            }
        }

        value = super.processValue(value, isRoot);

        if (value && (typeof value === 'object' && (value.constructor === Object || Array.isArray(value))) && !isRoot) {
            const keys = <string[]>this.container.resolveEnvPlaceholders(Reflect.ownKeys(value),true);

            const result: any/*{[i:string]: any}| Array<any>*/ = Array.isArray(value)? [] : {};

            for(const k  of keys)
                result[(<any>k)] = value[k];
            value = result;

            // console.log('Finnal Result: ', result);
            
        }

        
        // console.log(`ResolveEnvPlaceholdersPass[]`,'originalValue: ',originalValue,'result: ', value);

        return value;
    }
}

export default ResolveEnvPlaceholdersPass;