"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceCircularReferenceException extends Error {
    constructor(message, path) {
        super(message + path.join(', '));
    }
}
class CheckCircularReferencesPass {
    constructor() {
        this.currentPath = [];
        this.checkedNodes = {};
    }
    /**
     * Checks the ContainerBuilder object for circular references.
     */
    process(container) {
        const graph = container.getCompiler().getServiceReferenceGraph();
        this.checkedNodes = {};
        const nodes = graph.getNodes();
        for (const id in nodes) {
            const node = nodes[id];
            this.currentPath = [id];
            this.checkOutEdges(node.getOutEdges());
        }
    }
    /**
     * Checks for circular references.
     *
     * @param ServiceReferenceGraphEdge[] edges An array of Edges
     *
     * @throws ServiceCircularReferenceException when a circular reference is found
     */
    checkOutEdges(edges) {
        for (const edge of edges) {
            const node = edge.getDestNode();
            const id = node.getId();
            if (!(id in (this.checkedNodes)) || this.checkedNodes[id] == false) {
                // Don't check circular references for lazy edges
                if (!node.getValue() || (!edge.isLazy() && !edge.isWeak())) {
                    const searchKey = this.currentPath.indexOf(id);
                    this.currentPath.push(id);
                    if (-1 !== searchKey) {
                        throw new ServiceCircularReferenceException(id, this.currentPath.slice(searchKey));
                    }
                    this.checkOutEdges(node.getOutEdges());
                }
                this.checkedNodes[id] = true;
                this.currentPath.pop();
            }
        }
    }
}
