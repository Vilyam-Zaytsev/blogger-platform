import {ExtensionsType} from "../types/result-types/extensions-type";
import {ApiErrorResult} from "../types/input-output-types/api-error-result";

const mapResultExtensionsToErrorMessage = (extensions: ExtensionsType): ApiErrorResult => {
    return {
        errorsMessages: [...extensions]
    };
};

export {mapResultExtensionsToErrorMessage};