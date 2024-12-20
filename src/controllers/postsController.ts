import {Request, Response} from "express";
import {PostInputModel, PostViewModel} from "../types/input-output-types/posts-types";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/input-output-types/request-types";
import {postsRepository} from "../repositoryes/posts-repository";
import {SETTINGS} from "../settings";

const postsController = {
    getPosts: async (
        req: Request,
        res: Response<PostViewModel[]>) => {
        try {
            const posts: PostViewModel[] = await postsRepository.findPosts();

            res
                .status(SETTINGS.HTTP_STATUSES.OK_200)
                .json(posts);
        } catch (error) {
            console.error(error);
        }
    },
    getPost: async (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {
        try {
            const foundPost: PostViewModel | null = await postsRepository.findPostById(req.params.id);

            if (!foundPost) {
                res
                    .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                    .json({});

                return;
            }

            res
                .status(SETTINGS.HTTP_STATUSES.OK_200)
                .json(foundPost);

            return;
        } catch (error) {
            console.error(error);
        }

    },
    createPost: async (
        req: RequestWithBody<PostInputModel>,
        res: Response<PostViewModel>) => {
        const dataCreatingPost = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
        };
        const createdPost: PostViewModel = await postsRepository
            .createPost(dataCreatingPost);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdPost);
    },
    updatePost: async (
        req: RequestWithParamsAndBody<{ id: string }, PostInputModel>,
        res: Response) => {
        const dataUpdatingPost = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId
        };
        const updatedPost: boolean = await postsRepository.updatePost(req.params.id, dataUpdatingPost);

        if (!updatedPost) {
            res
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .json({});

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
            .json({});
    },
    deletePost: async (
        req: RequestWithParams<{ id: string }>,
        res: Response) => {
        const isDeletedPost: boolean = await postsRepository.deletePost(req.params.id);

        if (!isDeletedPost) {
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

export {postsController};