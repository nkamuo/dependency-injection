import { InvalidArgumentException } from "../Container";
import { Reference } from "../Reference";
import { ServiceReferenceGraphEdge } from "./ServiceReferenceGraphEdge";
import { ServiceReferenceGraphNode } from "./ServiceReferenceGraphNode";

export class ServiceReferenceGraph
{
    /**
     * @var ServiceReferenceGraphNode[]
     */
    private nodes: {[i:string]:ServiceReferenceGraphNode} = {};

    public  hasNode(id: string)
    {
        return (id in this.nodes);
    }

    public  getNode(id: string): ServiceReferenceGraphNode
    {
        if (!(id in this.nodes)) {
            throw new InvalidArgumentException(`There is no node with id "${id}".`);
        }

        return this.nodes[id];
    }

    /**
     * Returns all nodes.
     *
     * @return ServiceReferenceGraphNode[]
     */
    public  getNodes()
    {
        return this.nodes;
    }

    /**
     * Clears all nodes.
     */
    public  clear()
    {
        for(const index in this.nodes) {
            const node = this.nodes[index];
            node.clear();
        }
        this.nodes = {};
    }

    /**
     * Connects 2 nodes together in the Graph.
     */
    public connect(sourceId: string, sourceValue: any, destId: string, destValue: any = null, reference: Reference = null as any, lazy = false, weak = false, byConstructor = false)
    {
        if (null === sourceId || null === destId) {
            return;
        }

        var sourceNode = this.createNode(sourceId, sourceValue);
        var destNode = this.createNode(destId, destValue);
        var edge = new ServiceReferenceGraphEdge(sourceNode, destNode, reference, lazy, weak, byConstructor);

        sourceNode.addOutEdge(edge);
        destNode.addInEdge(edge);
    }

    private  createNode(id: string, value: any): ServiceReferenceGraphNode
    {
        if ((id in this.nodes) && this.nodes[id].getValue() === value) {
            return this.nodes[id];
        }

        return this.nodes[id] = new ServiceReferenceGraphNode(id, value);
    }
}
