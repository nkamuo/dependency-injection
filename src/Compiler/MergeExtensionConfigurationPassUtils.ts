import { RuntimeException } from "../Container";
import ContainerBuilder from "../ContainerBuilder";
import { Extension } from "../Extension/Extension";
import { EnvPlaceholderParameterBag } from "../ParameterBag/EnvPlaceholderParameterBag";
import { ParameterBag } from "../ParameterBag/ParameterBag";
import { CompilerPass } from "./CompilerPass";
import { PassHookPoint } from "./PassConfig";


// console.log('supper:ContainerBuilder => ',ContainerBuilder);

/**
 * @internal
 */
 export class MergeExtensionConfigurationParameterBag<T> extends EnvPlaceholderParameterBag<T>
 {
     private processedEnvPlaceholders: {[i:string]: any} = {};
 
     public  constructor(parameterBag: EnvPlaceholderParameterBag<T>)
     {
         super(parameterBag.all());
         this.mergeEnvPlaceholders(parameterBag);
     }
 
     public  freezeAfterProcessing(extension: Extension, container: ContainerBuilder)
     {
         var config: any;
 
         if (!(config = extension.getProcessedConfigs())) {
             // Extension::processConfiguration() wasn't called, we cannot know how configs were merged
             return;
         }
         this.processedEnvPlaceholders = [];
 
         // serialize config and container to catch env vars nested in object graphs
         // config = serialize(config).serialize(container.getDefinitions()).serialize(container.getAliases()).serialize(container.getParameterBag().all());
 
         var basePlaceholders: any;
         for(const env in (basePlaceholders =  super.getEnvPlaceholders())) {
             const placeholders = basePlaceholders[env];
 
             for(const placeholder of placeholders) {
                 // if (false !== stripos(config, placeholder)) {
                 if (new RegExp(`${placeholder}`).test(config)) {
                     this.processedEnvPlaceholders[env] = placeholders;
                     break;
                 }
             }
         }
     }
 
     /**
      * {@inheritdoc}
      */
     public  getEnvPlaceholders()
     {
         return this.processedEnvPlaceholders ?? super.getEnvPlaceholders();
     }
 
     public  getUnusedEnvPlaceholders(): string[]
     {
         const otherKeys = [...Object.keys(this.processedEnvPlaceholders)];
         return null == this.processedEnvPlaceholders ? [] : 
         [...Object.keys(super.getEnvPlaceholders())].filter( (key) =>  otherKeys.includes(key));;
     }
 }
 
 /**
  * A container builder preventing using methods that wouldn't have any effect from extensions.
  *
  * @internal
  */
 export class MergeExtensionConfigurationContainerBuilder extends ContainerBuilder
 {
     private extensionClass: Function;
 
     public  constructor(extension: Extension, parameterBag: ParameterBag<any> = null as any)
     {
         super(parameterBag);
 
         this.extensionClass = extension.constructor;
         // this.extensionClass = \get_class(extension);
     }
 
     /**
      * {@inheritdoc}
      */
     public  addCompilerPass(pass: CompilerPass, type = PassHookPoint.BEFORE_OPTIMIZATION, priority = 0): ContainerBuilder
     {
         throw new RuntimeException(`You cannot add compiler pass "${typeof pass}" from extension "${this.extensionClass.name}". Compiler passes must be registered before the container is compiled.`);
     }
 
     /**
      * {@inheritdoc}
      */
     public  registerExtension(extension: Extension)
     {
         throw new RuntimeException('You cannot register extension "%s" from "%s". Extensions must be registered before the container is compiled.');
     }
 
     /**
      * {@inheritdoc}
      */
     public  compile(resolveEnvPlaceholders = false)
     {
         throw new RuntimeException(('Cannot compile the container in extension "%s".'));
     }
 
     /**
      * {@inheritdoc}
      */
     public  resolveEnvPlaceholders(value: any, format = null,usedEnvs = null)
     {
         if (true !== format || !(typeof value == null)) {
             return super.resolveEnvPlaceholders(value, format, usedEnvs);
         }
 
         const bag = this.getParameterBag();
         value = bag.resolveValue(value);
 
         if (!(bag instanceof EnvPlaceholderParameterBag)) {
             return super.resolveEnvPlaceholders(value, format, usedEnvs);
         }
 
         var envPlaceholders: any;
 
         for( const env in (envPlaceholders = bag.getEnvPlaceholders())) {
             const placeholders = envPlaceholders[env];
             if (!env.includes(':')) {
                 continue;
             }
             for(const placeholder of placeholders) {
                 if (false !== new RegExp(placeholder).test(placeholder)) {
                     throw new RuntimeException(`Using a cast in "env(${env})" is incompatible with resolution at compile time in "${this.extensionClass.name}". The logic in the extension should be moved to a compiler pass, or an env parameter with no cast should be used instead.`);
                 }
             }
         }
 
         return super.resolveEnvPlaceholders(value, format, usedEnvs);
     }
 }
 