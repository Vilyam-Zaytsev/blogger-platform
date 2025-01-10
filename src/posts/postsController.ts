import {Response} from "express";
import {PostInputModel, PostViewModel, URIParamsPostIdModel} from "./types/input-output-types";
import {
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery
} from "../common/types/input-output-types/request-types";
import {SETTINGS} from "../common/settings";
import {postsService} from "./services/posts-service";
import {configPaginationAndSortParams} from "../common/helpers/config-pagination-and-sort-params";
import {PaginationResponse, SortingAndPaginationParamsType} from "../common/types/input-output-types/pagination-sort-types";
import {qPostsService} from "./services/qPosts-service";
import {URIParamsBlogId} from "../blogs/types/input-output-types";

const postsController = {
    getPosts: async (
        req: RequestWithParamsAndQuery<URIParamsBlogId, SortingAndPaginationParamsType>,
        res: Response<PaginationResponse<PostViewModel>>
    ) => {

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
        }

        const blogId: string = req.params.id

        const foundPosts: PaginationResponse<PostViewModel> | null = await qPostsService
            .findPosts(configPaginationAndSortParams(sortingAndPaginationParams), blogId);

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
        res: Response<PostViewModel>
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
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
    },
    deletePost: async (
        req: RequestWithParams<URIParamsPostIdModel>,
        res: Response
    ) => {
        const isDeletedPost: boolean = await postsService
            .deletePost(req.params.id);

        if (!isDeletedPost) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
    },
};

export {postsController};