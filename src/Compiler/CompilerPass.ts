import { ContainerBuilder } from "../ContainerBuilder";

export interface CompilerPass{
    
    /**
     * You can modify the container here before it is dumped to  code.
     */
     process(container: ContainerBuilder): void;
}


export default CompilerPass;