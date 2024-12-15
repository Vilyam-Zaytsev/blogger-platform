import {Request, Response} from "express";
import {PostInputModel, PostViewModel} from "../types/input-output-types/posts-types";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/input-output-types/request-types";
import {postsRepository} from "../repositoryes/posts-repository";

const postsController = {
    getPosts: (
        req: Request,
        res: Response<PostViewModel[]>) => {
        const posts: PostViewModel[] = postsRepository.getAllPosts();

        res
            .status(200)
            .json(posts);
    },
    getPost: (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {
        const foundPost: PostViewModel | undefined = postsRepository
            .getPostById(req.params.id);

        if (!foundPost) {
            res
                .status(404)
                .end();
        }

        res
            .status(200)
            .json(foundPost);
    },
    createPost: (
        req: RequestWithBody<PostInputModel>,
        res: Response<PostViewModel>) => {
        const dataCreatingPost = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId
        };
        const createdPost: PostViewModel = postsRepository
            .createNewPost(dataCreatingPost);

        res
            .status(201)
            .json(createdPost);
    },
    updatePost: (
        req: RequestWithParamsAndBody<{ id: string }, PostInputModel>,
        res: Response) => {
        const dataUpdatingPost = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId
        };
        const updatedPost: boolean = postsRepository
            .updateExistingPost(req.params.id, dataUpdatingPost);

        if (!updatedPost) {
            res
                .status(404)
                .end();
        }

        res
            .status(204)
            .end();
    },
    deletePost: (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {
        const isDeletedPost: boolean = postsRepository
            .deletePostById(req.params.id);

        if (!isDeletedPost) {
            res
                .status(404)
                .end();
        }

        res
            .status(204)
            .end();
    },
};

export {postsController};