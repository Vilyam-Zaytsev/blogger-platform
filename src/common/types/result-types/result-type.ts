import {ResultStatus} from "./result-status";
import {ExtensionsType} from "./extensions-type";

type ResultType<T = null> = {
    status: ResultStatus,
    errorMessage?: string,
    extensions: ExtensionsType,
    data: T
};

export {ResultType};