"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceReferenceGraphEdge = void 0;
class ServiceReferenceGraphEdge {
    constructor(sourceNode, destNode, value = null, lazy = false, weak = false, byConstructor = false) {
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
    getValue() {
        return this.value;
    }
    /**
     * Returns the source node.
     *
     * @return ServiceReferenceGraphNode
     */
    getSourceNode() {
        return this.sourceNode;
    }
    /**
     * Returns the destination node.
     *
     * @return ServiceReferenceGraphNode
     */
    getDestNode() {
        return this.destNode;
    }
    /**
     * Returns true if the edge is lazy, meaning it's a dependency not requiring direct instantiation.
     *
     * @return bool
     */
    isLazy() {
        return this.lazy;
    }
    /**
     * Returns true if the edge is weak, meaning it shouldn't prevent removing the target service.
     *
     * @return bool
     */
    isWeak() {
        return this.weak;
    }
    /**
     * Returns true if the edge links with a constructor argument.
     *
     * @return bool
     */
    isReferencedByConstructor() {
        return this.byConstructor;
    }
}
exports.ServiceReferenceGraphEdge = ServiceReferenceGraphEdge;
