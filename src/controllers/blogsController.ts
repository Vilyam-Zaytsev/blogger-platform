import {Request, Response} from "express";
import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {blogsRepository} from "../repositoryes/blogs-repository";

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
        req: Request,
        res: Response) => {

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