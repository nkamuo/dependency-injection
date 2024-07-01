"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergeExtensionConfigurationContainerBuilder = void 0;
const MergeExtensionConfigurationPassUtils_1 = require("../src/Compiler/MergeExtensionConfigurationPassUtils");
Object.defineProperty(exports, "MergeExtensionConfigurationContainerBuilder", { enumerable: true, get: function () { return MergeExtensionConfigurationPassUtils_1.MergeExtensionConfigurationContainerBuilder; } });
const Container_1 = require("../src/Container");
const ContainerBuilder_1 = require("../src/ContainerBuilder");
const DefaultParameterBag_1 = require("../src/ParameterBag/DefaultParameterBag");
const Reference_1 = require("../src/Reference");
const parameterBag = new DefaultParameterBag_1.DefaultParameterBag({
    age: 23,
    name: "Callistus nkamuo",
});
const builder = new ContainerBuilder_1.ContainerBuilder(parameterBag);
class BaseService {
    sayHello(name = "Callistus") {
        const message = `Hello ${name}`;
        console.log(message);
        return message;
    }
}
class ConsumerService {
    constructor(greeter) {
        this.greeter = greeter;
    }
    sayHello(name = "Callistus") {
        this.greeter.sayHello("Stupid MF");
    }
}
builder.register('nkamuo', BaseService);
const consumer = builder.register('consumer', ConsumerService).setPublic(true);
consumer.addArgument(new Reference_1.Reference('nkamuo'));
builder.compile();
builder.get(Container_1.Container.name);
console.log(builder.getServiceIds());
const serv = builder.get('consumer');
serv.sayHello();
