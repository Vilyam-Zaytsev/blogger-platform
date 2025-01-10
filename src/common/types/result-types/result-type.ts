import {ResultStatusType} from "./result-status-type";
import {ExtensionsType} from "./extensions-type";

type ResultType<T = null> = {
    status: ResultStatusType,
    errorMessage?: string,
    extensions?: ExtensionsType,
    data: T
};

export {ResultType};