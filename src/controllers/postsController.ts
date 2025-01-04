import {Request, Response} from "express";
import {PostInputModel, PostViewModel, URIParamsPostIdModel} from "../types/input-output-types/posts-types";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/input-output-types/request-types";
import {SETTINGS} from "../settings";
import {InsertOneResult, WithId} from "mongodb";
import {PostDbType} from "../types/db-types/post-db-type";
import {postsService} from "../services/posts-service";
import {paginationParams} from "../helpers/pagination-params";
import {PaginationResponse} from "../types/input-output-types/pagination-types";
import {qPostsService} from "../services/qPosts-service";
import {qBlogsService} from "../services/qBlogs-service";
import {BlogViewModel} from "../types/input-output-types/blogs-types";

const postsController = {
    getPosts: async (
        req: Request,
        res: Response<PaginationResponse<PostDbType> | {}>
    ) => {

        if (req.body.blogId) {
            const isExistBlog: BlogViewModel | null = await qBlogsService
                .findBlog(req.body.blogId);

            if (!isExistBlog) {
                res
                    .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                    .json({});
            }
        }

        const foundPosts: PaginationResponse<PostDbType> = await qPostsService
            .findPosts(paginationParams(req));

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundPosts);
    },
    getPost: async (
        req: RequestWithParams<URIParamsPostIdModel>,
        res: Response<PostViewModel | {}>
    ) => {

        const foundPost: PostViewModel | null = await qPostsService
            .findPost(req.params.id);

        if (!foundPost) {
            res
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .json({});

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundPost);
    },
    createAndInsertPost: async (
        req: RequestWithBody<PostInputModel>,
        res: Response<PostViewModel | {}>
    ) => {

        const isExistBlog: BlogViewModel | null = await qBlogsService
            .findBlog(req.body.blogId);

        if (!isExistBlog) {
            res
                .status(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
                .json({});
        }

        const dataForCreatingPost: PostInputModel = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
        };

        const result: InsertOneResult = await postsService
            .createPost(dataForCreatingPost);

        const createdPost: PostViewModel | null = await qPostsService
            .findPost(result.insertedId);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdPost!);
    },
    updatePost: async (
        req: RequestWithParamsAndBody<URIParamsPostIdModel, PostInputModel>,
        res: Response<PostViewModel | {}>
    ) => {

        const dataForPostUpdates: PostInputModel = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId
        };

        const updatedPost: boolean = await postsService
            .updatePost(req.params.id, dataForPostUpdates);

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
        res: Response
    ) => {
        const isDeletedPost: boolean = await postsService
            .deletePost(req.params.id);

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