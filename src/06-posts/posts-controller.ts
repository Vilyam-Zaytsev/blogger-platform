import {Response} from "express";
import {PostInputModel, PostViewModel} from "./types/input-output-types";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery
} from "../common/types/input-output-types/request-types";
import {SETTINGS} from "../common/settings";
import {postsService} from "./domain/posts-service";
import {createPaginationAndSortFilter} from "../common/helpers/create-pagination-and-sort-filter";
import {
    PaginationAndSortFilterType,
    Paginator,
    SortingAndPaginationParamsType
} from "../common/types/input-output-types/pagination-sort-types";
import {IdType} from "../common/types/input-output-types/id-type";
import {postsQueryRepository} from "./repositoryes/posts-query-repository";

class PostsController {

    async getPosts(
        req: RequestWithQuery<SortingAndPaginationParamsType>,
        res: Response<Paginator<PostViewModel>>
    ){

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
        };

        const paginationAndSortFilter: PaginationAndSortFilterType = createPaginationAndSortFilter(sortingAndPaginationParams)

        const foundPosts: PostViewModel[] = await postsQueryRepository
            .findPosts(paginationAndSortFilter);

        const postsCount: number = await postsQueryRepository
            .getPostsCount();

        const paginationResponse: Paginator<PostViewModel> = await postsQueryRepository
            ._mapPostsViewModelToPaginationResponse(
                foundPosts,
                postsCount,
                paginationAndSortFilter
            );

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(paginationResponse);
    }

    async getPost(
        req: RequestWithParams<IdType>,
        res: Response<PostViewModel>
    ){

        const foundPost: PostViewModel | null = await postsQueryRepository
            .findPost(req.params.id);

        if (!foundPost) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundPost);
    }

    async createPost(
        req: RequestWithBody<PostInputModel>,
        res: Response<PostViewModel>
    ){

        const dataForCreatingPost: PostInputModel = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
        };

        const idCreatedPost: string | null = await postsService
            .createPost(dataForCreatingPost);

        const createdPost: PostViewModel | null = await postsQueryRepository
            .findPost(idCreatedPost);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdPost!);
    }

    async updatePost(
        req: RequestWithParamsAndBody<IdType, PostInputModel>,
        res: Response<PostViewModel>
    ){

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
    }

    async deletePost(
        req: RequestWithParams<IdType>,
        res: Response
    ){

        const isDeletedPost: boolean = await postsService
            .deletePost(req.params.id);

        if (!isDeletedPost) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
    }
}

const postsController: PostsController = new PostsController();

export {postsController};