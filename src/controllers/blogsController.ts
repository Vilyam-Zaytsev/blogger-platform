import {Request, Response} from "express";
import {BlogInputModel, BlogViewModel, URIParamsBlogIdModel} from "../types/input-output-types/blogs-types";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/input-output-types/request-types";
import {SETTINGS} from "../settings";
import {blogsService} from "../services/blogs-service";
import {InsertOneResult, WithId} from "mongodb";
import {qBlogsRepository} from "../repositoryes/qBlogs-repository";
import {BlogDbType} from "../types/db-types/blog-db-type";

const blogsController = {
    getBlogs: async (
        req: Request,
        res: Response<BlogViewModel[]>) => {
        const blogs: BlogViewModel[] = await qBlogsRepository.findBlogsAndMapToViewModel();

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(blogs);

        return;
    },
    getBlog: async (
        req: RequestWithParams<URIParamsBlogIdModel>,
        res: Response<BlogViewModel | {}>) => {
            const foundBlog: WithId<BlogDbType> | null = await qBlogsRepository.findBlog(req.params.id);

            if (!foundBlog) {
                res
                    .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                    .json({});

                return;
            }

            const blog: BlogViewModel = qBlogsRepository
                .mapToViewModel(foundBlog);

            res
                .status(SETTINGS.HTTP_STATUSES.OK_200)
                .json(blog);
    },
    createBlog: async (
        req: RequestWithBody<BlogInputModel>,
        res: Response<BlogViewModel>) => {
        const dataCreatingBlog = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };
        const result: InsertOneResult = await blogsService
            .createBlog(dataCreatingBlog);

        const blog: BlogViewModel = await qBlogsRepository.findBlogAndMapToViewModel(result.insertedId);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(blog);
    },
    updateBlog: async (
        req: RequestWithParamsAndBody<URIParamsBlogIdModel, BlogInputModel>,
        res: Response) => {
            const data = {
                name: req.body.name,
                description: req.body.description,
                websiteUrl: req.body.websiteUrl
            };
            const updatedBlog: boolean = await blogsService
                .updateBlog(req.params.id, data);

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
        req: RequestWithParams<URIParamsBlogIdModel>,
        res: Response) => {
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