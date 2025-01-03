import {Request, Response, NextFunction} from "express";
import {ObjectId} from "mongodb";
import {SETTINGS} from "../../settings";

const checkBlogId = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {id} = req.params;

    if (!id || !ObjectId.isValid(id)) {
        res
            .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
            .json({});

        return;
    }

    req.body.blogId = id;

    next();
};

export {checkBlogId};