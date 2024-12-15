import {Request, Response} from "express";
import {PostViewModel} from "../types/input-output-types/posts-types";
import {RequestWithParams} from "../types/input-output-types/request-types";

const postsController = {
    getPosts: (
        req: Request,
        res: Response<PostViewModel[]>) => {
        const posts: PostViewModel[] = postsRepositiry.getAllPosts();

        res
            .status(200)
            .json(posts);
    },
    getPost: (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {

    },
    createPost: (
        req: Request,
        res: Response) => {

    },
    updatePost: (
        req: Request,
        res: Response) => {

    },
    deletePost: (
        req: Request,
        res: Response) => {

    },
};

export {postsController};