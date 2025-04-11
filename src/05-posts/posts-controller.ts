import {Response} from "express";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery
} from "../common/types/input-output-types/request-types";
import {SETTINGS} from "../common/settings";
import {PostsService} from "./application/posts-service";
import {Paginator,} from "../common/types/input-output-types/pagination-sort-types";
import {IdType} from "../common/types/input-output-types/id-type";
import {PostsQueryRepository} from "./repositoryes/posts-query-repository";
import {injectable} from "inversify";
import {SortingAndPaginationParamsType, SortQueryDto} from "../common/helpers/sort-query-dto";
import {PostDto} from "./domain/post-dto";
import {PostInputModel, PostViewModel} from "./domain/post-entity";
import {LikeInputModel} from "../07-likes/like-entity";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatus} from "../common/types/result-types/result-status";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";

@injectable()
class PostsController {

    constructor(
        private postsService: PostsService,
        private postsQueryRepository: PostsQueryRepository
    ) {
    };

    async getPosts(
        req: RequestWithQuery<SortingAndPaginationParamsType>,
        res: Response<Paginator<PostViewModel>>
    ) {

        const userId: string | null = req.user ? req.user.id : null;

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
        };

        const sortQueryDto: SortQueryDto = new SortQueryDto(sortingAndPaginationParams)

        const foundPosts: PostViewModel[] = await this.postsQueryRepository
            .findPosts(sortQueryDto, userId);

        const postsCount: number = await this.postsQueryRepository
            .getPostsCount();

        const paginationResponse: Paginator<PostViewModel> = await this.postsQueryRepository
            ._mapPostsViewModelToPaginationResponse(
                foundPosts,
                postsCount,
                sortQueryDto
            );

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(paginationResponse);
    }

    async getPost(
        req: RequestWithParams<IdType>,
        res: Response<PostViewModel>
    ) {

        const userId: string | null = req.user ? req.user.id : null;

        const postId: string = req.params.id;

        const foundPost: PostViewModel | null = await this.postsQueryRepository
            .findPost(postId, userId);

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
    ) {

        const userId: string | null = req.user ? req.user.id : null;

        const {
            title,
            shortDescription,
            content,
            blogId,
        } = req.body;

        const postDto: PostDto = new PostDto(
            title,
            shortDescription,
            content,
            blogId
        );

        const postCreationResult: string = await this.postsService
            .createPost(postDto);

        const createdPost: PostViewModel | null = await this.postsQueryRepository
            .findPost(postCreationResult, userId);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdPost!);
    }

    async updatePost(
        req: RequestWithParamsAndBody<IdType, PostInputModel>,
        res: Response<PostViewModel>
    ) {

        const {
            title,
            shortDescription,
            content,
            blogId,
        } = req.body;

        const postDto: PostDto = new PostDto(
            title,
            shortDescription,
            content,
            blogId
        );

        const updatedPost: boolean = await this.postsService
            .updatePost(req.params.id, postDto);

        if (!updatedPost) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
    }

    async updatePostReactions(
        req: RequestWithParamsAndBody<IdType, LikeInputModel>,
        res: Response
    ) {

        const {id: postId} = req.params;
        const {likeStatus} = req.body;
        const {id: userId} = req.user!;

        const {status: reactionUpdateStatus}: ResultType = await this.postsService
            .updatePostReaction(postId, userId, likeStatus);

        if (reactionUpdateStatus !== ResultStatus.Success) {

            res
                .sendStatus(mapResultStatusToHttpStatus(reactionUpdateStatus));

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }

    async deletePost(
        req: RequestWithParams<IdType>,
        res: Response
    ) {

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