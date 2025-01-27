import {Response} from "express";
import {PostInputModel, PostViewModel} from "./types/input-output-types";
import {
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery
} from "../common/types/input-output-types/request-types";
import {SETTINGS} from "../common/settings";
import {postsService} from "./services/posts-service";
import {createPaginationAndSortFilter} from "../common/helpers/create-pagination-and-sort-filter";
import {Paginator, SortingAndPaginationParamsType} from "../common/types/input-output-types/pagination-sort-types";
import {postsQueryService} from "./services/posts-query-service";
import {IdType} from "../common/types/input-output-types/id-type";

const postsController = {
    getPosts: async (
        req: RequestWithParamsAndQuery<IdType, SortingAndPaginationParamsType>,
        res: Response<Paginator<PostViewModel>>
    ) => {

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
        }

        const blogId: string = req.params.id

        const foundPosts: Paginator<PostViewModel> | null = await postsQueryService
            .findPosts(createPaginationAndSortFilter(sortingAndPaginationParams), blogId);

        if (!foundPosts) {
            res.sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundPosts);
    },
    getPost: async (
        req: RequestWithParams<IdType>,
        res: Response<PostViewModel>
    ) => {

        const foundPost: PostViewModel | null = await postsQueryService
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
        req: RequestWithParamsAndBody<IdType, PostInputModel>,
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

        const createdPost: PostViewModel | null = await postsQueryService
            .findPost(idCreatedPost);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdPost!);
    },
    updatePost: async (
        req: RequestWithParamsAndBody<IdType, PostInputModel>,
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
        req: RequestWithParams<IdType>,
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