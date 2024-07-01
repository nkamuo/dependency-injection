"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceReferenceGraphNode = void 0;
const Alias_1 = require("../Alias");
const Definition_1 = require("../Definition");
class ServiceReferenceGraphNode {
    constructor(id, value) {
        this.inEdges = [];
        this.outEdges = [];
        this.id = id;
        this.value = value;
    }
    addInEdge(edge) {
        this.inEdges.push(edge);
    }
    addOutEdge(edge) {
        this.outEdges.push(edge);
    }
    /**
     * Checks if the value of this node is an Alias.
     *
     * @return bool
     */
    isAlias() {
        return this.value instanceof Alias_1.Alias;
    }
    /**
     * Checks if the value of this node is a Definition.
     *
     * @return bool
     */
    isDefinition() {
        return this.value instanceof Definition_1.Definition;
    }
    /**
     * Returns the identifier.
     *
     * @return string
     */
    getId() {
        return this.id;
    }
    /**
     * Returns the in edges.
     *
     * @return ServiceReferenceGraphEdge[]
     */
    getInEdges() {
        return this.inEdges;
    }
    /**
     * Returns the out edges.
     *
     * @return ServiceReferenceGraphEdge[]
     */
    getOutEdges() {
        return this.outEdges;
    }
    /**
     * Returns the value of this Node.
     *
     * @return mixed
     */
    getValue() {
        return this.value;
    }
    /**
     * Clears all edges.
     */
    clear() {
        this.inEdges = this.outEdges = [];
    }
}
exports.ServiceReferenceGraphNode = ServiceReferenceGraphNode;
