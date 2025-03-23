import {Response} from "express";
import {PostInputModel, PostViewModel} from "./types/input-output-types";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery
} from "../common/types/input-output-types/request-types";
import {SETTINGS} from "../common/settings";
import {PostsService} from "./domain/posts-service";
import {Paginator,} from "../common/types/input-output-types/pagination-sort-types";
import {IdType} from "../common/types/input-output-types/id-type";
import {PostsQueryRepository} from "./repositoryes/posts-query-repository";
import {injectable} from "inversify";
import {SortingAndPaginationParamsType, SortQueryDto} from "../common/helpers/sort-query-dto";

@injectable()
class PostsController {

    constructor(
        private postsService: PostsService,
        private postsQueryRepository: PostsQueryRepository
    ) {};

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

        const paginationAndSortFilter: SortQueryDto = new SortQueryDto(sortingAndPaginationParams)

        const foundPosts: PostViewModel[] = await this.postsQueryRepository
            .findPosts(paginationAndSortFilter);

        const postsCount: number = await this.postsQueryRepository
            .getPostsCount();

        const paginationResponse: Paginator<PostViewModel> = await this.postsQueryRepository
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

        const foundPost: PostViewModel | null = await this.postsQueryRepository
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

        const idCreatedPost: string | null = await this.postsService
            .createPost(dataForCreatingPost);

        const createdPost: PostViewModel | null = await this.postsQueryRepository
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

        const updatedPost: boolean = await this.postsService
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

        const isDeletedPost: boolean = await this.postsService
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

export {PostsController};