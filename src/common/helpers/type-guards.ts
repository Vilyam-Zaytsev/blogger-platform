import {ResultType} from "../types/result-types/result-type";
import {ResultStatus} from "../types/result-types/result-status";

const isSuccess = <T>(result: ResultType<T | null>): result is ResultType<T> => {

    return result.status === ResultStatus.Success;
};

const isSuccessfulResult = <T>(status: ResultStatus, data: T | null): data is T => {

    return status === ResultStatus.Success;
};

export {
    isSuccess,
    isSuccessfulResult
};