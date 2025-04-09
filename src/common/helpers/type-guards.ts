import {ResultType} from "../types/result-types/result-type";
import {ResultStatus} from "../types/result-types/result-status";
import {PayloadAccessTokenType} from "../../01-auth/types/payload-access-token-type";
import {PayloadRefreshTokenType} from "../../01-auth/types/payload-refresh-token-type";

const isSuccess = <T>(result: ResultType<T | null>): result is ResultType<T> => {

    return result.status === ResultStatus.Success;
};

const isSuccessfulResult = <T>(status: ResultStatus, data: T | null): data is T => {

    return status === ResultStatus.Success;
};

export {
    isSuccess,
    isSuccessfulResult,
};