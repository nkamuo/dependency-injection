"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceReferenceGraph = void 0;
const Container_1 = require("../Container");
const ServiceReferenceGraphEdge_1 = require("./ServiceReferenceGraphEdge");
const ServiceReferenceGraphNode_1 = require("./ServiceReferenceGraphNode");
class ServiceReferenceGraph {
    constructor() {
        /**
         * @var ServiceReferenceGraphNode[]
         */
        this.nodes = {};
    }
    hasNode(id) {
        return (id in this.nodes);
    }
    getNode(id) {
        if (!(id in this.nodes)) {
            throw new Container_1.InvalidArgumentException(`There is no node with id "${id}".`);
        }
        return this.nodes[id];
    }
    /**
     * Returns all nodes.
     *
     * @return ServiceReferenceGraphNode[]
     */
    getNodes() {
        return this.nodes;
    }
    /**
     * Clears all nodes.
     */
    clear() {
        for (const index in this.nodes) {
            const node = this.nodes[index];
            node.clear();
        }
        this.nodes = {};
    }
    /**
     * Connects 2 nodes together in the Graph.
     */
    connect(sourceId, sourceValue, destId, destValue = null, reference = null, lazy = false, weak = false, byConstructor = false) {
        if (null === sourceId || null === destId) {
            return;
        }
        var sourceNode = this.createNode(sourceId, sourceValue);
        var destNode = this.createNode(destId, destValue);
        var edge = new ServiceReferenceGraphEdge_1.ServiceReferenceGraphEdge(sourceNode, destNode, reference, lazy, weak, byConstructor);
        sourceNode.addOutEdge(edge);
        destNode.addInEdge(edge);
    }
    createNode(id, value) {
        if ((id in this.nodes) && this.nodes[id].getValue() === value) {
            return this.nodes[id];
        }
        return this.nodes[id] = new ServiceReferenceGraphNode_1.ServiceReferenceGraphNode(id, value);
    }
}
exports.ServiceReferenceGraph = ServiceReferenceGraph;
