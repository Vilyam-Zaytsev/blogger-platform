import {Request, Response} from "express";
import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {blogsRepository} from "../repositoryes/blogs-repository";
import {RequestWithParams, RequestWithParamsAndBody} from "../types/input-output-types/request-types";

const blogsController = {
    getBlogs: (
        req: Request,
        res: Response<BlogViewModel[]>) => {
        const blogs: BlogViewModel[] = blogsRepository
            .getAllBlogs();

        res
            .status(200)
            .json(blogs);
    },
    getBlog: (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {
        const foundBlog: BlogViewModel | undefined = blogsRepository
            .getBlogById(req.params.id);

        if (!foundBlog) {
            res
                .status(404)
                .end();
        }

        res
            .status(200)
            .json(foundBlog)
    },
    createBlog: (
        req: Request<BlogInputModel>,
        res: Response<BlogViewModel>) => {
        const dataCreatingBlog = {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        };
        const createdBlog: BlogViewModel = blogsRepository
            .createNewBlog(dataCreatingBlog);

        res
            .status(201)
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
                .status(404)
                .end();
        }

        res
            .status(204)
            .end();
    },
    deleteBlog: (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {
        const isDeletedBlog: boolean = blogsRepository
            .deleteBlogById(req.params.id);

        if (!isDeletedBlog) {
            res
                .status(404)
                .end();
        }

        res
            .status(204)
            .end();
    },
};

export {blogsController};