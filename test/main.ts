
import { MergeExtensionConfigurationContainerBuilder } from "../src/Compiler/MergeExtensionConfigurationPassUtils";
import { Container } from "../src/Container";
import { ContainerBuilder } from "../src/ContainerBuilder";
import { DefaultParameterBag } from "../src/ParameterBag/DefaultParameterBag";
import { Reference } from "../src/Reference";

export  {MergeExtensionConfigurationContainerBuilder};

const parameterBag = new DefaultParameterBag({
    age: 23,
    name: "Callistus nkamuo",
});


const builder = new ContainerBuilder(parameterBag);

class BaseService{

    public sayHello(name = "Callistus"){
        const message = `Hello ${name}`;

        console.log(message);

        return message;
    }

}

class ConsumerService{

    private greeter: BaseService;


    constructor(greeter: BaseService){
        this.greeter = greeter;
    }

    public sayHello(name = "Callistus"){
        this.greeter.sayHello("Stupid MF");
    }

}


builder.register('nkamuo', BaseService);

const consumer = builder.register('consumer',ConsumerService).setPublic(true);

consumer.addArgument(new Reference('nkamuo'));

builder.compile();

builder.get(Container.name);


console.log(builder.getServiceIds());


const serv = builder.get('consumer');

serv.sayHello();