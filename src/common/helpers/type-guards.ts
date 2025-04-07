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

function isAccessToken(payload: any): payload is PayloadAccessTokenType {
    return typeof payload?.userId === 'string' &&
        typeof payload?.deviceId === 'undefined';
}

function isRefreshToken(payload: any): payload is PayloadRefreshTokenType {
    return typeof payload?.userId === 'string' &&
        typeof payload?.deviceId === 'string' &&
        typeof payload?.iat === 'number' &&
        typeof payload?.exp === 'number';
}

export {
    isSuccess,
    isSuccessfulResult,
    isAccessToken,
    isRefreshToken
};