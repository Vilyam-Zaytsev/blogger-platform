import {Request, Response, NextFunction} from "express";
import {ObjectId, WithId} from "mongodb";
import {SETTINGS} from "../../settings";
import {qBlogsRepository} from "../../repositoryes/qBlogs-repository";
import {BlogDbType} from "../../types/db-types/blog-db-type";

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

    const blog: WithId<BlogDbType> | null = await qBlogsRepository
        .findBlog(id);

    if (!blog) {
        res
            .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
            .json({});

        return;
    }

    next();
};

export {checkBlogId};