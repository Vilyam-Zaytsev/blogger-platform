import {Request, Response, NextFunction} from "express";
import {ObjectId} from "mongodb";
import {SETTINGS} from "../../settings";
import {BlogViewModel} from "../../types/input-output-types/blogs-types";
import {qBlogsRepository} from "../../repositoryes/qBlogs-repository";

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

    const blog: BlogViewModel = await qBlogsRepository
        .findBlogAndMapToViewModel(new ObjectId(id));

    if (!blog) {
        res
            .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
            .json({});

        return;
    }

    next();
};

export {checkBlogId};