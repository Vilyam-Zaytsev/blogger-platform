import {ResultStatus} from "../types/result-types/result-status";
import {ExtensionsType} from "../types/result-types/extensions-type";

class ResultObject<T> {
    status: ResultStatus;
    errorMessage?: string;
    extensions: ExtensionsType;
    data: T | null;

    protected constructor(
        status: ResultStatus,
        data: T | null,
        extensions: ExtensionsType,
        errorMessage?: string,
    ) {
        this.status = status;
        errorMessage ? this.errorMessage = errorMessage : -1;
        this.extensions = extensions;
        this.data = data;
    };
}

class SuccessResult<T = null> extends ResultObject<T> {

    private constructor(data: T) {

        super(ResultStatus.Success, data, []);
    };

    static create<T>(data: T) {

        return new this(data);
    };
}

class BadRequestResult<T = null> extends ResultObject<T> {

    private constructor(
        extensions: ExtensionsType,
        errorMessage: string
    ) {

        super(
            ResultStatus.BadRequest,
            null,
            extensions,
            errorMessage
        );
    };

    static create(
        field: string,
        extensionsMessage: string,
        errorMessage: string
    ) {

        const extensions: ExtensionsType = [
            {
                field,
                message: extensionsMessage
            }
        ];

        return new this(extensions, errorMessage);
    };
}

class UnauthorizedResult<T = null> extends ResultObject<T> {

    private constructor(
        extensions: ExtensionsType,
        errorMessage: string
    ) {

        super(
            ResultStatus.Unauthorized,
            null,
            extensions,
            errorMessage
        );
    };

    static create(
        field: string,
        extensionsMessage: string,
        errorMessage: string
    ) {

        const extensions: ExtensionsType = [
            {
                field,
                message: extensionsMessage
            }
        ];

        return new this(extensions, errorMessage);
    };
}

class ForbiddenResult<T = null> extends ResultObject<T> {

    private constructor(
        extensions: ExtensionsType,
        errorMessage: string
    ) {

        super(
            ResultStatus.Forbidden,
            null,
            extensions,
            errorMessage
        );
    };

    static create(
        field: string,
        extensionsMessage: string,
        errorMessage: string
    ) {

        const extensions: ExtensionsType = [
            {
                field,
                message: extensionsMessage
            }
        ];

        return new this(extensions, errorMessage);
    };
}

class NotFoundResult<T = null> extends ResultObject<T> {

    private constructor(
        extensions: ExtensionsType,
        errorMessage: string
    ) {

        super(
            ResultStatus.NotFound,
            null,
            extensions,
            errorMessage
        );
    };

    static create(
        field: string,
        extensionsMessage: string,
        errorMessage: string
    ) {

        const extensions: ExtensionsType = [
            {
                field,
                message: extensionsMessage
            }
        ];

        return new this(extensions, errorMessage);
    };
}

class InternalServerErrorResult<T = null> extends ResultObject<T> {

    private constructor(
        extensions: ExtensionsType,
        errorMessage: string
    ) {

        super(
            ResultStatus.InternalServerError,
            null,
            extensions,
            errorMessage
        );
    };

    static create(
        field: string,
        extensionsMessage: string,
        errorMessage: string
    ) {

        const extensions: ExtensionsType = [
            {
                field,
                message: extensionsMessage
            }
        ];

        return new this(extensions, errorMessage);
    };
}

export {
    SuccessResult,
    BadRequestResult,
    UnauthorizedResult,
    ForbiddenResult,
    NotFoundResult,
    InternalServerErrorResult
};