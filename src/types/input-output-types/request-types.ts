import {Request} from "express";

type RequestWithBody<B> = Request<{}, {}, B>;
type RequestWithParams<P> = Request<P>;
type RequestWithParamsAndBody<P, B> = Request<P, {}, B>;
type RequestWithParamsAndQuery<P, B> = Request<P, {}, {}, B>;

export {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery
};
