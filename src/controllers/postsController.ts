import {Request, Response} from "express";
import {PostInputModel, PostViewModel, URIParamsPostIdModel} from "../types/input-output-types/posts-types";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/input-output-types/request-types";
import {SETTINGS} from "../settings";
import {qPostsRepository} from "../repositoryes/qPosts-repository";
import {InsertOneResult, WithId} from "mongodb";
import {PostDbType} from "../types/db-types/post-db-type";
import {postsService} from "../services/posts-service";

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
        const dataCreatingPost: PostInputModel = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
        };
        const result: InsertOneResult = await postsService
            .createPost(dataCreatingPost);

        const post: PostViewModel = await qPostsRepository
            .findPostAndMapToViewModel(result.insertedId);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(post);
    },
    updatePost: async (
        req: RequestWithParamsAndBody<URIParamsPostIdModel, PostInputModel>,
        res: Response) => {
        const dataUpdatingPost = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId
        };
        const updatedPost: boolean = await postsService
            .updatePost(req.params.id, dataUpdatingPost);

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
        req: RequestWithParams<URIParamsPostIdModel>,
        res: Response) => {
        const isDeletedPost: boolean = await postsService.deletePost(req.params.id);

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