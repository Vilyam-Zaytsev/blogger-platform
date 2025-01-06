import {Response} from "express";
import {PostInputModel, PostViewModel, URIParamsPostIdModel} from "../types/input-output-types/posts-types";
import {
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery
} from "../types/input-output-types/request-types";
import {SETTINGS} from "../settings";
import {PostDbType} from "../types/db-types/post-db-type";
import {postsService} from "../services/posts-service";
import {paginationAndSortParams} from "../helpers/pagination-and-sort-params";
import {PaginationResponse} from "../types/input-output-types/pagination-types";
import {qPostsService} from "../services/qPosts-service";
import {URIParamsBlogId} from "../types/input-output-types/blogs-types";
import {PaginationAndSortFilterType} from "../types/input-output-types/sort-filter-types";

const postsController = {
    getPosts: async (
        req: RequestWithParamsAndQuery<URIParamsBlogId, PaginationAndSortFilterType>,
        res: Response<PaginationResponse<PostViewModel>>
    ) => {

        const filter: PaginationAndSortFilterType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            searchNameTerm: req.query.searchNameTerm
        }

        const blogId: string = req.params.id

        const foundPosts: PaginationResponse<PostViewModel> | null = await qPostsService
            .findPosts(paginationAndSortParams(filter), blogId);

        if (!foundPosts) {
            res.sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundPosts);
    },
    getPost: async (
        req: RequestWithParams<URIParamsPostIdModel>,
        res: Response<PostViewModel>
    ) => {

        const foundPost: PostViewModel | null = await qPostsService
            .findPost(req.params.id);

        if (!foundPost) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundPost);
    },
    createAndInsertPost: async (
        req: RequestWithParamsAndBody<URIParamsBlogId, PostInputModel>,
        res: Response<PostViewModel>
    ) => {
        const dataForCreatingPost: PostInputModel = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
        };

        const blogId: string = req.params.id;

        const idCreatedPost: string | null = await postsService
            .createPost(dataForCreatingPost, blogId);

        if (!idCreatedPost) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        const createdPost: PostViewModel | null = await qPostsService
            .findPost(idCreatedPost);

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