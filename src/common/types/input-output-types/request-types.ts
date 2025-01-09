import {Request} from "express";

type RequestWithParams<P> = Request<P>;
type RequestWithBody<B> = Request<{}, {}, B>;
type RequestWithQuery<Q> = Request<{}, {}, {}, Q>;
type RequestWithParamsAndBody<P, B> = Request<P, {}, B>;
type RequestWithParamsAndQuery<P, B> = Request<P, {}, {}, B>;

export {
    RequestWithParams,
    RequestWithBody,
    RequestWithQuery,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery
};
