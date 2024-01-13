import { ContainerBuilder } from "../ContainerBuilder";
import { CompilerPass } from "./CompilerPass";
import { PassConfig, PassHookPoint } from "./PassConfig";
import { ServiceReferenceGraph } from "./ServiceReferenceGraph";

class EnvParameterException extends Error{
    constructor(message: string){
        // console.log(...arguments);
        super(message);
        
    }
};

export class Compiler
{
    private passConfig: PassConfig;
    private logMessages: string[] = [];
    private serviceReferenceGraph: ServiceReferenceGraph;

    public  constructor()
    {
        this.passConfig = new PassConfig();
        this.serviceReferenceGraph = new ServiceReferenceGraph();
    }

    /**
     * @return PassConfig
     */
    public  getPassConfig()
    {
        return this.passConfig;
    }

    /**
     * @return ServiceReferenceGraph
     */
    public  getServiceReferenceGraph()
    {
        return this.serviceReferenceGraph;
    }

    public  addPass(pass: CompilerPass, type = PassHookPoint.BEFORE_OPTIMIZATION, priority = 0)
    {
        this.passConfig.addPass(pass, type, priority);
    }

    /**
     * @final
     */
    public  log(pass: CompilerPass, message: string)
    {
        if (message.includes("\n")) {
            message = message.trim().replace("\n", "\n" + (pass.constructor.name) + ': ');
        }

        this.logMessages.push(pass.constructor.name +': '+message);
    }

    /**
     * @return array
     */
    public  getLog()
    {
        return this.logMessages;
    }

    /**
     * Run the Compiler and process all Passes.
     */
    public  compile(container: ContainerBuilder)
    {
        try {
            for(const pass of this.passConfig.getPasses()) {
                pass.process(container);
            }
        } catch ( e) {
            const usedEnvs: any[] = [];
            var prev = <Error>e;
            do {
                const msg = prev.message;
                var resolvedMsg: string;

                if (msg !== (resolvedMsg = container.resolveEnvPlaceholders(msg, null, usedEnvs))) {
                    // r = new \ReflectionProperty(prev, 'message');
                    // r.setAccessible(true);
                    // r.setValue(prev, resolvedMsg);
                    //
                    prev.message = resolvedMsg;
                }
            } while (prev = (<any>prev).previous);

            if (usedEnvs) {
                // e = new EnvParameterException(usedEnvs + (<any>e));
            }

            throw e;
        } finally {
            this.getServiceReferenceGraph().clear();
        }
    }
}


export default Compiler;