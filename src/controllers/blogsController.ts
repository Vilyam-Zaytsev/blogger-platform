import {Request, Response} from "express";
import {
    BlogInputModel,
    BlogViewModel,
    URIParamsBlogId
} from "../types/input-output-types/blogs-types";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody
} from "../types/input-output-types/request-types";
import {SETTINGS} from "../settings";
import {blogsService} from "../services/blogs-service";
import {InsertOneResult} from "mongodb";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {paginationParams} from "../helpers/pagination-params";
import {PaginationResponse} from "../types/input-output-types/pagination-types";
import {qBlogsService} from "../services/qBlogs-service";

const blogsController = {
    getBlogs: async (
        req: Request,
        res: Response<PaginationResponse<BlogDbType>>
    ) => {

        const foundBlogs: PaginationResponse<BlogDbType> = await qBlogsService
            .findBlogs(paginationParams(req));

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundBlogs);
    },
    getBlog: async (
        req: RequestWithParams<URIParamsBlogId>,
        res: Response<BlogViewModel | {}>
    ) => {

        const foundBlog: BlogViewModel | null = await qBlogsService
            .findBlog(req.params.id);

        if (!foundBlog) {
            res
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .json({});

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundBlog);
    },
    createAndInsertBlog: async (
        req: RequestWithBody<BlogInputModel>,
        res: Response<BlogViewModel | {}>
    ) => {

        const dataForCreatingBlog: BlogInputModel = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };

        const result: InsertOneResult = await blogsService
            .createBlog(dataForCreatingBlog);

        const createdBlog: BlogViewModel | null = await qBlogsService
            .findBlog(result.insertedId);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdBlog!);
    },
    updateBlog: async (
        req: RequestWithParamsAndBody<URIParamsBlogId, BlogInputModel>,
        res: Response<BlogViewModel | {}>
    ) => {

        const dataForBlogUpdates: BlogInputModel = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };

        const updatedBlog: boolean = await blogsService
            .updateBlog(req.params.id, dataForBlogUpdates);

        if (!updatedBlog) {
            res
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .json({});

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
            .json({});
    },
    deleteBlog: async (
        req: RequestWithParams<URIParamsBlogId>,
        res: Response
    ) => {

        const isDeletedBlog: boolean = await blogsService
            .deleteBlog(req.params.id);

        if (!isDeletedBlog) {
            res
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .json({});

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
            .json({});
    },
};

export {blogsController};