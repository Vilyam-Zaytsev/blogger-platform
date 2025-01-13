import {Request} from "express";
import {IdType} from "./id-type";

type RequestWithParams<P> = Request<P>;
type RequestWithBody<B> = Request<{}, {}, B>;
type RequestWithQuery<Q> = Request<{}, {}, {}, Q>;
type RequestWithParamsAndBody<P, B> = Request<P, {}, B>;
type RequestWithParamsAndQuery<P, B> = Request<P, {}, {}, B>;
type RequestWithUserId<U extends IdType> = Request<{}, {}, {}, {}, U>;

export {
    RequestWithParams,
    RequestWithBody,
    RequestWithQuery,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithUserId
};
