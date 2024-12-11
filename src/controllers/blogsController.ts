import {Request, Response} from "express";
import {BlogViewModel} from "../types/input-output-types/blogs-types";
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
        req: Request,
        res: Response) => {

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