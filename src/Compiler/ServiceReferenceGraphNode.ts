import { Alias } from "../Alias";
import { Definition } from "../Definition";
import { ServiceReferenceGraphEdge } from "./ServiceReferenceGraphEdge";

export class ServiceReferenceGraphNode
{
    private id: string;
    private inEdges: ServiceReferenceGraphEdge[] = [];
    private outEdges: ServiceReferenceGraphEdge[] = [];
    private value: any;

    public  constructor(id: string, value: any)
    {
        this.id = id;
        this.value = value;
    }

    public  addInEdge(edge: ServiceReferenceGraphEdge)
    {
        this.inEdges.push(edge);
    }

    public  addOutEdge(edge: ServiceReferenceGraphEdge)
    {
        this.outEdges.push(edge);
    }

    /**
     * Checks if the value of this node is an Alias.
     *
     * @return bool
     */
    public  isAlias()
    {
        return this.value instanceof Alias;
    }

    /**
     * Checks if the value of this node is a Definition.
     *
     * @return bool
     */
    public  isDefinition()
    {
        return this.value instanceof Definition;
    }

    /**
     * Returns the identifier.
     *
     * @return string
     */
    public  getId()
    {
        return this.id;
    }

    /**
     * Returns the in edges.
     *
     * @return ServiceReferenceGraphEdge[]
     */
    public  getInEdges()
    {
        return this.inEdges;
    }

    /**
     * Returns the out edges.
     *
     * @return ServiceReferenceGraphEdge[]
     */
    public  getOutEdges()
    {
        return this.outEdges;
    }

    /**
     * Returns the value of this Node.
     *
     * @return mixed
     */
    public  getValue()
    {
        return this.value;
    }

    /**
     * Clears all edges.
     */
    public  clear()
    {
        this.inEdges = this.outEdges = [];
    }
}
