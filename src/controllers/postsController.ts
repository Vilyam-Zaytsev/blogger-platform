import {Request, Response} from "express";
import {PostInputModel, PostViewModel, URIParamsPostIdModel} from "../types/input-output-types/posts-types";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/input-output-types/request-types";
import {postsRepository} from "../repositoryes/posts-repository";
import {SETTINGS} from "../settings";
import {qPostsRepository} from "../repositoryes/qPosts-repository";
import {WithId} from "mongodb";
import {PostDbType} from "../types/db-types/post-db-type";

const postsController = {
    getPosts: async (
        req: Request,
        res: Response<PostViewModel[]>) => {
            const posts: PostViewModel[] = await qPostsRepository
                .findPostsAndMapToViewModel();

            res
                .status(SETTINGS.HTTP_STATUSES.OK_200)
                .json(posts);
    },
    getPost: async (
        req: RequestWithParams<URIParamsPostIdModel>,
        res: Response<PostViewModel | {}>) => {
            const foundPost: WithId<PostDbType> | null = await qPostsRepository
                .findPost(req.params.id);

            if (!foundPost) {
                res
                    .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                    .json({});

                return;
            }

            const post: PostViewModel = qPostsRepository
                .mapToViewModel(foundPost);

            res
                .status(SETTINGS.HTTP_STATUSES.OK_200)
                .json(post);
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