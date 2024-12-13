import {Request, Response} from "express";
import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {blogsRepository} from "../repositoryes/blogs-repository";
import {RequestWithParams} from "../types/input-output-types/request-types";

const blogsController = {
    getBlogs: (
        req: Request,
        res: Response<BlogViewModel[]>) => {
        const blogs: BlogViewModel[] = blogsRepository.getAllBlogs();

        res
            .status(200)
            .json(blogs);
    },
    getBlog: (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {
        const foundBlog: BlogViewModel | undefined = blogsRepository.getBlogById(req.params.id);

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
        const createdBlog: BlogViewModel = blogsRepository.createNewBlog(req.body);

        res
            .status(201)
            .json(createdBlog);
    },
    updateBlog: (
        req: Request,
        res: Response) => {

    },
    deleteBlog: (
        req: Request,
        res: Response) => {

    },
};

export {blogsController};