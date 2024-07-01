"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
const PassConfig_1 = require("./PassConfig");
const ServiceReferenceGraph_1 = require("./ServiceReferenceGraph");
class EnvParameterException extends Error {
    constructor(message) {
        // console.log(...arguments);
        super(message);
    }
}
;
class Compiler {
    constructor() {
        this.logMessages = [];
        this.passConfig = new PassConfig_1.PassConfig();
        this.serviceReferenceGraph = new ServiceReferenceGraph_1.ServiceReferenceGraph();
    }
    /**
     * @return PassConfig
     */
    getPassConfig() {
        return this.passConfig;
    }
    /**
     * @return ServiceReferenceGraph
     */
    getServiceReferenceGraph() {
        return this.serviceReferenceGraph;
    }
    addPass(pass, type = PassConfig_1.PassHookPoint.BEFORE_OPTIMIZATION, priority = 0) {
        this.passConfig.addPass(pass, type, priority);
    }
    /**
     * @final
     */
    log(pass, message) {
        if (message.includes("\n")) {
            message = message.trim().replace("\n", "\n" + (pass.constructor.name) + ': ');
        }
        this.logMessages.push(pass.constructor.name + ': ' + message);
    }
    /**
     * @return array
     */
    getLog() {
        return this.logMessages;
    }
    /**
     * Run the Compiler and process all Passes.
     */
    compile(container) {
        try {
            for (const pass of this.passConfig.getPasses()) {
                pass.process(container);
            }
        }
        catch (e) {
            const usedEnvs = [];
            var prev = e;
            do {
                const msg = prev.message;
                var resolvedMsg;
                if (msg !== (resolvedMsg = container.resolveEnvPlaceholders(msg, null, usedEnvs))) {
                    // r = new \ReflectionProperty(prev, 'message');
                    // r.setAccessible(true);
                    // r.setValue(prev, resolvedMsg);
                    //
                    prev.message = resolvedMsg;
                }
            } while (prev = prev.previous);
            if (usedEnvs) {
                // e = new EnvParameterException(usedEnvs + (<any>e));
            }
            throw e;
        }
        finally {
            this.getServiceReferenceGraph().clear();
        }
    }
}
exports.Compiler = Compiler;
exports.default = Compiler;
