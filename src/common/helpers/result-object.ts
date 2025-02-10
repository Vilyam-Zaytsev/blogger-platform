import {ResultStatus} from "../types/result-types/result-status";
import {ExtensionsType} from "../types/result-types/extensions-type";

class ResultObject<T = null> {
    status: ResultStatus;
    errorMessage?: string;
    extensions: ExtensionsType;
    data: T;

    private constructor(
        status: ResultStatus,
        errorMessage?: string,
        extensions?: ExtensionsType,
        data?: T,
    ) {
        this.status = status;
        errorMessage ? this.errorMessage = errorMessage : -1;
        this.extensions = extensions ? extensions : [];
        this.data = data ? data : null as T;
    };

    static positive<T = null>(status: ResultStatus, data?: T): ResultObject<T> {

        if (!data) return new ResultObject<T>(status);

        return new ResultObject<T>(status, undefined, undefined, data);
    };

    static negative(status: ResultStatus, field: string, errorMessage: string): ResultObject {

        const extensions: ExtensionsType = [
            {
                field,
                message: errorMessage
            }
        ];

        return new ResultObject(status, errorMessage, extensions);
    }

}

export {ResultObject};