import {Request, Response} from "express";
import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {blogsRepository} from "../repositoryes/blogs-repository";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/input-output-types/request-types";
import {SETTINGS} from "../settings";

const blogsController = {
    getBlogs: (
        req: Request,
        res: Response<BlogViewModel[]>) => {
        const blogs: BlogViewModel[] = blogsRepository
            .getAllBlogs();

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(blogs);
    },
    getBlog: (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {
        const foundBlog: BlogViewModel | undefined = blogsRepository
            .getBlogById(req.params.id);

        if (!foundBlog) {
            res
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .end();
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundBlog);
    },
    createBlog: (
        req: RequestWithBody<BlogInputModel>,
        res: Response<BlogViewModel>) => {
        const dataCreatingBlog = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };
        const createdBlog: BlogViewModel = blogsRepository
            .createNewBlog(dataCreatingBlog);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdBlog);
    },
    updateBlog: (
        req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>,
        res: Response) => {
        const dataUpdatingBlog = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };
        const updatedBlog: boolean = blogsRepository
            .updateExistingBlog(req.params.id, dataUpdatingBlog);

        if (!updatedBlog) {
            res
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .end();
        }

        res
            .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
            .end();
    },
    deleteBlog: (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {
        const isDeletedBlog: boolean = blogsRepository
            .deleteBlogById(req.params.id);

        if (!isDeletedBlog) {
            res
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .end();
        }

        res
            .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
            .end();
    },
};

export {blogsController};