import {validationResult} from "express-validator";
import {Request, Response, NextFunction} from "express";
import {FieldNameType} from "../../types/input-output-types/output-errors-type";

const inputCheckErrorsMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const e = validationResult(req);
    if (!e.isEmpty()) {
        const errors = e.array({onlyFirstError: true}) as { path: FieldNameType, msg: string }[];

        res
            .status(400)
            .json({
                errorsMessages: errors.map(e => ({field: e.path, message: e.msg}))
            });

        return
    }

    next();
};

export {inputCheckErrorsMiddleware};