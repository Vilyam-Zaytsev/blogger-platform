import {Response} from "express";
import {
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery
} from "../common/types/input-output-types/request-types";
import {IdType} from "../common/types/input-output-types/id-type";
import {CommentInputModel, CommentViewModel} from "./types/input-output-types";
import {ResultType} from "../common/types/result-types/result-type";
import {CommentsService} from "./application/comments-service";
import {ResultStatus} from "../common/types/result-types/result-status";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {SETTINGS} from "../common/settings";
import {CommentQueryRepository} from "./repositoryes/comment-query-repository";
import {Paginator,} from "../common/types/input-output-types/pagination-sort-types";
import {injectable} from "inversify";
import {SortingAndPaginationParamsType, SortQueryDto} from "../common/helpers/sort-query-dto";
import {isSuccessfulResult} from "../common/helpers/type-guards";
import {LikeInputModel} from "../07-likes/types/input-output-types";

@injectable()
class CommentsController {

    constructor(
        private commentsService: CommentsService,
        private commentQueryRepository: CommentQueryRepository
    ) {
    };

    async getComments(
        req: RequestWithParamsAndQuery<IdType, SortingAndPaginationParamsType>,
        res: Response<Paginator<CommentViewModel>>
    ) {

        const {id: postId} = req.params;

        const resultCheckPostId: ResultType = await this.commentsService
            ._checkPostId(postId);

        if (resultCheckPostId.status !== ResultStatus.Success) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
        };

        const sortQueryDto: SortQueryDto = new SortQueryDto(sortingAndPaginationParams);

        const foundComments: CommentViewModel[] = await this.commentQueryRepository
            .findComments(sortQueryDto, postId);

        const commentsCount: number = await this.commentQueryRepository
            .getCommentsCount(postId);

        const paginationResponse: Paginator<CommentViewModel> = await this.commentQueryRepository
            ._mapCommentsViewModelToPaginationResponse(
                foundComments,
                commentsCount,
                sortQueryDto
            );

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(paginationResponse);
    }

    async getComment(
        req: RequestWithParams<IdType>,
        res: Response<CommentViewModel>
    ) {

        const foundComment: CommentViewModel | null = await this.commentQueryRepository
            .findComment(req.params.id);

        if (!foundComment) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundComment);
    }

    async createComment(
        req: RequestWithParamsAndBody<IdType, CommentInputModel>,
        res: Response<CommentViewModel>
    ) {

        const {content} = req.body
        const {id: postId} = req.params;
        const {id: commentatorId} = req.user!

        const {
            status: commentCreationStatus,
            data: idCreatedComment
        }: ResultType<string | null> = await this.commentsService
            .createComment(content, postId, commentatorId);

        if (!isSuccessfulResult(commentCreationStatus, idCreatedComment)) {

            res
                .sendStatus(mapResultStatusToHttpStatus(commentCreationStatus));

            return;
        }

        const createdComment: CommentViewModel | null = await this.commentQueryRepository
            .findComment(idCreatedComment);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdComment!);
    }

    async updateComment(
        req: RequestWithParamsAndBody<IdType, CommentInputModel>,
        res: Response
    ) {

        const {id: commentId} = req.params;

        const {id: userId} = req.user!;

        const dataForCommentUpdates: CommentInputModel = {
            content: req.body.content
        };

        const updateResult: ResultType = await this.commentsService
            .updateComment(commentId, userId, dataForCommentUpdates);

        if (updateResult.status !== ResultStatus.Success) {

            res
                .sendStatus(mapResultStatusToHttpStatus(updateResult.status));

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }

    async updateCommentReaction(
        req: RequestWithParamsAndBody<IdType, LikeInputModel>,
        res: Response
    ) {
        const {id: commentId} = req.params;
        const {likeStatus} = req.body;
        const {id: userId} = req.user!;

        const resultUpdateCommentReaction = await this.commentsService
            .updateCommentReaction(userId, commentId, likeStatus);
    }

    async deleteComment(
        req: RequestWithParams<IdType>,
        res: Response
    ) {

        const {id: commentId} = req.params;

        const {id: userId} = req.user!;

        const deleteResult: ResultType = await this.commentsService
            .deleteComment(commentId, userId);

        if (deleteResult.status !== ResultStatus.Success) {

            res
                .sendStatus(mapResultStatusToHttpStatus(deleteResult.status));

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }
}

export {CommentsController};