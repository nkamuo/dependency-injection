import { RuntimeException } from "../Container";
import { ContainerBuilder } from '../ContainerBuilder';
// import { ContainerBuilder } from "../ContainerBuilder";
import { Extension } from "../Extension/Extension";
import { EnvPlaceholderParameterBag } from "../ParameterBag/EnvPlaceholderParameterBag";
import { ParameterBag } from "../ParameterBag/ParameterBag";
import { CompilerPass } from "./CompilerPass";
import { MergeExtensionConfigurationContainerBuilder, MergeExtensionConfigurationParameterBag } from "./MergeExtensionConfigurationPassUtils";
import { PassHookPoint } from "./PassConfig";


export class MergeExtensionConfigurationPass implements CompilerPass
{

    private extensions:string[] = [];


    constructor(extensions?: string[]){
        if(extensions)
            this.extensions = extensions;
    }
    /**
     * {@inheritdoc}
     */
    public  process(container: ContainerBuilder)
    {
        const parameters = container.getParameterBag().all();
        const definitions = container.getDefinitions();
        const aliases = container.getAliases();
        const exprLangProviders = container.getExpressionLanguageProviders();
        const configAvailable = false;
        // const configAvailable = class_exists(BaseNode::class);

        var tmpContainer: MergeExtensionConfigurationContainerBuilder;

        const extensions = container.getExtensions();

        /** @var Extension */
        for(const index in extensions) {

            const extension = extensions[index];

            if (extension instanceof Extension) {   //PrependExtensionInterface
                extension.prepend(container);
            }
        }

        for( const name in extensions) {
            const extension = extensions[name];
            var config: any;

            if (!(config = container.getExtensionConfig(name))) {
                // this extension was not called
                continue;
            }

            var resolvingBag = container.getParameterBag();
            if (resolvingBag instanceof EnvPlaceholderParameterBag && extension instanceof Extension) {
                // create a dedicated bag so that we can track env vars per-extension
                resolvingBag = new MergeExtensionConfigurationParameterBag(resolvingBag);
                if (configAvailable) {
                    // BaseNode::setPlaceholderUniquePrefix(resolvingBag.getEnvPlaceholderUniquePrefix());
                }
            }
            config = resolvingBag.resolveValue(config);

            try {
                tmpContainer = new MergeExtensionConfigurationContainerBuilder(extension, resolvingBag);
                tmpContainer.addDefinitions(definitions);           //TODO: Remove this call
                tmpContainer.addAliases(aliases);
                // tmpContainer.p


                tmpContainer.setResourceTracking(container.isTrackingResources());
                // tmpContainer.addObjectResource(extension);
                // if (extension instanceof ConfigurationExtensionInterface && null !== (configuration = extension.getConfiguration(config, tmpContainer))) {
                //     tmpContainer.addObjectResource(configuration);
                // }

                // for(const provider of exprLangProviders) {
                //     // tmpContainer.addExpressionLanguageProvider(provider);
                // }

                tmpContainer = container as any;

                extension.load(config, tmpContainer);
            } catch (e) {
                const parameterBag = container.getParameterBag();
                if (resolvingBag instanceof MergeExtensionConfigurationParameterBag && (parameterBag instanceof EnvPlaceholderParameterBag) ) {
                    parameterBag.mergeEnvPlaceholders(resolvingBag);
                }

                throw e;
            }

            if (resolvingBag instanceof MergeExtensionConfigurationParameterBag) {
                // don't keep track of env vars that are *overridden* when configs are merged
                resolvingBag.freezeAfterProcessing(extension, tmpContainer);
            }

            container.merge(tmpContainer);
            container.getParameterBag().add(parameters);
        }

        container.addDefinitions(definitions);
        container.addAliases(aliases);
    }
}
