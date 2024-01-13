import { ServiceReferenceGraphNode } from "./ServiceReferenceGraphNode";

export class ServiceReferenceGraphEdge
{
    private sourceNode: ServiceReferenceGraphNode;
    private destNode: ServiceReferenceGraphNode;
    private value: any;
    private lazy: boolean;
    private weak: boolean;
    private byConstructor: boolean;

    public  constructor(sourceNode: ServiceReferenceGraphNode, destNode: ServiceReferenceGraphNode, value: any = null,lazy = false, weak = false, byConstructor = false)
    {
        this.sourceNode = sourceNode;
        this.destNode = destNode;
        this.value = value;
        this.lazy = lazy;
        this.weak = weak;
        this.byConstructor = byConstructor;
    }

    /**
     * Returns the value of the edge.
     *
     * @return mixed
     */
    public  getValue(): any
    {
        return this.value;
    }

    /**
     * Returns the source node.
     *
     * @return ServiceReferenceGraphNode
     */
    public  getSourceNode()
    {
        return this.sourceNode;
    }

    /**
     * Returns the destination node.
     *
     * @return ServiceReferenceGraphNode
     */
    public  getDestNode()
    {
        return this.destNode;
    }

    /**
     * Returns true if the edge is lazy, meaning it's a dependency not requiring direct instantiation.
     *
     * @return bool
     */
    public  isLazy()
    {
        return this.lazy;
    }

    /**
     * Returns true if the edge is weak, meaning it shouldn't prevent removing the target service.
     *
     * @return bool
     */
    public  isWeak()
    {
        return this.weak;
    }

    /**
     * Returns true if the edge links with a constructor argument.
     *
     * @return bool
     */
    public  isReferencedByConstructor()
    {
        return this.byConstructor;
    }
}
