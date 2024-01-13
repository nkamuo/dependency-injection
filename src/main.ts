import Alias from './Alias';
import AbstractArgument from './Argument/AbstractArgument';
import Argument from './Argument/Argument';
import BoundArgument from './Argument/BoundArgument';
import IteratorArgument from './Argument/IteratorArgument';
import ServiceClosureArgument from './Argument/ServiceClosureArgument';
import ChildDefinition from './ChildDefinition';
import Container from './Container';
import Definition from './Definition';
import Parameter from './Parameter';
import Reference from './Reference';
import TypedReference from './TypedReference';
import { MergeExtensionConfigurationContainerBuilder } from './Compiler/MergeExtensionConfigurationPassUtils';
import ContainerBuilder from './ContainerBuilder';
import Extension from './Extension/Extension';
import TaggedIteratorArgument from './Argument/TaggedIteratorArgument';
import DefaultParameterBag from './ParameterBag/DefaultParameterBag';
import EnvPlaceholderParameterBag from './ParameterBag/EnvPlaceholderParameterBag';
import { ParameterBag } from './ParameterBag/ParameterBag';
import { MergeExtensionConfigurationPass } from './Compiler/MergeExtensionConfigurationPass';
import PriorityTaggedService from './Compiler/PriorityTaggedService';
import { CompilerPass } from './Compiler/CompilerPass';
import {PassConfig, PassHookPoint} from './Compiler/PassConfig';


// console.log('MergeExtensionConfigurationContainerBuilder: ',MergeExtensionConfigurationContainerBuilder);

export {
    Alias,
    Container,
    ContainerBuilder,
    Definition,
    ChildDefinition,

    Extension,

    Reference,
    TypedReference,
    Parameter,

    DefaultParameterBag,
    EnvPlaceholderParameterBag,


    Argument,
    AbstractArgument,
    BoundArgument,
    IteratorArgument,
    TaggedIteratorArgument,
    ServiceClosureArgument,
    
    MergeExtensionConfigurationContainerBuilder,
    MergeExtensionConfigurationPass,
    PriorityTaggedService,
    PassConfig,
    PassHookPoint,
};

export type {
    CompilerPass,
    ParameterBag,
};


export default ContainerBuilder;
