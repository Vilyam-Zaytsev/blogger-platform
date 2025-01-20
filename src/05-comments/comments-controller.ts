import {Response} from "express";
import {
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery
} from "../common/types/input-output-types/request-types";
import {IdType} from "../common/types/input-output-types/id-type";
import {CommentInputModel, CommentViewModel} from "./types/input-output-types";
import {ResultType} from "../common/types/result-types/result-type";
import {commentsService} from "./comments-service";
import {ResultStatus} from "../common/types/result-types/result-status";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {SETTINGS} from "../common/settings";
import {commentQueryRepository} from "./repositoryes/comment-query-repository";
import {
    PaginationAndSortFilterType,
    PaginationResponse,
    SortingAndPaginationParamsType
} from "../common/types/input-output-types/pagination-sort-types";
import {createPaginationAndSortFilter} from "../common/helpers/create-pagination-and-sort-filter";

const commentsController = {

    async getComments(
        req: RequestWithParamsAndQuery<IdType, SortingAndPaginationParamsType>,
        res: Response<PaginationResponse<CommentViewModel>>
    ) {

        const postId: string = req.params.id;

        //TODO спросить на поддержке про данную реализацию проверки на корректность postId
        // и существование поста с таким id!!!
        // (Правильно ли ее делать в контроллере через метод сервиса или нужно делать только в контроллере???)

        const resultCheckPostId: ResultType<string | null> = await commentsService
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

        const paginationAndSortFilter: PaginationAndSortFilterType =
            createPaginationAndSortFilter(sortingAndPaginationParams)


        const foundComments: CommentViewModel[] = await commentQueryRepository
            .findComments(paginationAndSortFilter, postId);

        const commentsCount: number = await commentQueryRepository
            .getCommentsCount(postId);

        const paginationResponse: PaginationResponse<CommentViewModel> = await commentQueryRepository
            ._mapCommentsViewModelToPaginationResponse(
                foundComments,
                commentsCount,
                paginationAndSortFilter
            );

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(paginationResponse)
    },

    async getComment(
        req: RequestWithParams<IdType>,
        res: Response<CommentViewModel>
    ) {

        const foundComment: CommentViewModel | null = await commentQueryRepository
            .findComment(req.params.id);

        if (!foundComment) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundComment);
    },

    //TODO стоит ли делать проветку postId в контроллере???

    async createAndInsertComment(
        req: RequestWithParamsAndBody<IdType, CommentInputModel>,
        res: Response<CommentViewModel>
    ) {

        const dataForCreatingComment: CommentInputModel = {
            content: req.body.content
        };

        const postId: string = req.params.id;
        const commentatorId: string = String(req.user?.id);

        const resultCreateComment: ResultType<string | null> = await commentsService
            .createComment(dataForCreatingComment, postId, commentatorId);

        if (resultCreateComment.status !== ResultStatus.Created) {
            res
                .sendStatus(mapResultStatusToHttpStatus(resultCreateComment.status));

            return;
        }

        const createdComment: CommentViewModel | null = await commentQueryRepository
            .findComment(resultCreateComment.data!);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdComment!);
    },
    async updateComment(
        req: RequestWithParamsAndBody<IdType, CommentInputModel>,
        res: Response
    ) {

        const commentId: string = req.params.id;

        const userId: string = String(req.user?.id);

        const dataForCommentUpdates: CommentInputModel = {
            content: req.body.content
        };

        const updateResult: ResultType = await commentsService
            .updateComment(commentId, userId, dataForCommentUpdates);

        if (updateResult.status !== ResultStatus.Success) {
            res
                .sendStatus(mapResultStatusToHttpStatus(updateResult.status));

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    },
    async deleteComment(
        req: RequestWithParams<IdType>,
        res: Response
    ) {
        const deleteResult: ResultType = await commentsService
            .deleteComment(req.params.id);

        if (deleteResult.status !== ResultStatus.Success) {
            res
                .sendStatus(mapResultStatusToHttpStatus(deleteResult.status));
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }
};

export {commentsController};