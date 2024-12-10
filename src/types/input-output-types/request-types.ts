import {Request} from "express";

type RequestWithBody<T> = Request<{}, {}, T>;
type RequestWithParams<T> = Request<T>;
type RequestWithParamsAndBody<T, B> = Request<T, {}, B>;

export {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody
};
