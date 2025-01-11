import {ExtensionsType} from "../types/result-types/extensions-type";
import {OutputErrorsType} from "../types/input-output-types/output-errors-type";

const mapResultExtensionsToErrorMessage = (extensions: ExtensionsType): OutputErrorsType => {
    return {
        errorsMessage: [...extensions]
    };
};

export {mapResultExtensionsToErrorMessage};