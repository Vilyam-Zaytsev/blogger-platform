import {Request} from "express";
import {IdType} from "./id-type";
import {TokenSessionDataType} from "../../../02-sessions/types/token-session-data-type";

type RequestWithParams<P> = Request<P>;
type RequestWithBody<B> = Request<{}, {}, B>;
type RequestWithQuery<Q> = Request<{}, {}, {}, Q>;
type RequestWithParamsAndBody<P, B> = Request<P, {}, B>;
type RequestWithParamsAndQuery<P, B> = Request<P, {}, {}, B>;
type RequestWithUserId<U extends IdType> = Request<{}, {}, {}, {}, U>;
type RequestWithSession<S extends TokenSessionDataType> = Request<{}, {}, {}, {}, S>;
type RequestWithUserIdAndSession<U extends IdType, S extends TokenSessionDataType> = Request<{}, {}, {}, {}, U & S>;

export {
    RequestWithParams,
    RequestWithBody,
    RequestWithQuery,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithUserId,
    RequestWithSession,
    RequestWithUserIdAndSession
};
