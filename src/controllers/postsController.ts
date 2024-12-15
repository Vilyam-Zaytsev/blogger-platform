import {Request, Response} from "express";
import {PostInputModel, PostViewModel} from "../types/input-output-types/posts-types";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/input-output-types/request-types";
import {postsRepository} from "../repositoryes/posts-repository";
import {SETTINGS} from "../settings";

const postsController = {
    getPosts: (
        req: Request,
        res: Response<PostViewModel[]>) => {
        const posts: PostViewModel[] = postsRepository.getAllPosts();

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(posts);
    },
    getPost: (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {
        const foundPost: PostViewModel | undefined = postsRepository
            .getPostById(req.params.id);

        if (!foundPost) {
            res
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .end();
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundPost);
    },
    createPost: (
        req: RequestWithBody<PostInputModel>,
        res: Response<PostViewModel>) => {
        const dataCreatingPost = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
        };
        const createdPost: PostViewModel = postsRepository
            .createNewPost(dataCreatingPost);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
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
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .end();
        }

        res
            .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
            .end();
    },
    deletePost: (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {
        const isDeletedPost: boolean = postsRepository
            .deletePostById(req.params.id);

        if (!isDeletedPost) {
            res
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .end();
        }

        res
            .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
            .end();
    },
};

export {postsController};