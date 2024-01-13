import { InvalidArgumentException } from '../Container';
import { ContainerBuilder } from '../ContainerBuilder';

export abstract class Extension {
    private processedConfigs: {[i: string]: any} = {};
    // tslint:disable-next-line:no-empty
    public prepend(container: ContainerBuilder ) {}


    /**
     * {@inheritdoc}
     */
    public  getXsdValidationBasePath() {
        return false;
    }

    /**
     * {@inheritdoc}
     */
    public  getNamespace(): string|false {
        return 'http://example.org/schema/dic/' + this.getAlias();
    }

    /**
     * Returns the recommended alias to use in XML.
     *
     * This alias is also the mandatory prefix to use when using YAML.
     *
     * This convention is to remove the "Extension" postfix from the class
     * name and then lowercase and underscore the result. So:
     *
     *     AcmeHelloExtension
     *
     * becomes
     *
     *     acme_hello
     *
     * This can be overridden in a sub-class to specify the alias manually.
     *
     * @return string
     *
     * @throws BadMethodCallException When the extension name does not follow conventions
     */
    public  getAlias(): string {

        return this.constructor.name.toUpperCase();

    }


    /**
     * {@inheritdoc}
     */
    public  getConfiguration(config: {[i: string]: any}, container: ContainerBuilder): {[i: string]: any} {

        throw new Error('Please Set extension configuration method');
    }

    /**
     * @internal
     */
    public  getProcessedConfigs(): {[i: string]: any} {
        try {
            return this.processedConfigs;
        } finally {
            this.processedConfigs = [];
        }
    }


    /**
     * Loads a specific configuration.
     *
     * @throws \InvalidArgumentException When provided tag is not defined in this extension
     */
    public abstract load(configs: {[i: string]: any}, container: ContainerBuilder): void;

    /**
     * @return bool
     *
     * @throws InvalidArgumentException When the config is not enableable
     */
    protected  isConfigEnabled(container: ContainerBuilder, config: {[i: string]: any}) {
        if (!('enabled' in config)) {
            throw new InvalidArgumentException('The config array has no \'enabled\' key.');
        }

        return Boolean( container.getParameterBag().resolveValue(config.enabled));
    }



    protected  processConfiguration(configuration: any, configs: {[i: string]: any}): {[i: string]: any} {
        throw new Error('Please Set extension configuration method');
        // processor = new Processor();

        // return this.processedConfigs[] = processor.processConfiguration(configuration, configs);
        // return {};
    }
}


export default Extension;
