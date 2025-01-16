import {Request, Response} from "express";
import {
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery
} from "../common/types/input-output-types/request-types";
import {IdType} from "../common/types/input-output-types/id-type";
import {CommentInputModel, CommentViewModel} from "./types/input-output-types";
import {ResultType} from "../common/types/result-types/result-type";
import {commentsService} from "./comments-service";
import {ResultStatusType} from "../common/types/result-types/result-status-type";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {SETTINGS} from "../common/settings";
import {commentQueryRepository} from "./repositoryes/comment-query-repository";
import {
    PaginationAndSortFilterType,
    PaginationResponse,
    SortingAndPaginationParamsType
} from "../common/types/input-output-types/pagination-sort-types";
import {CommentDbType} from "./types/comment-db-type";
import {WithId} from "mongodb";
import {createPaginationAndSortFilter} from "../common/helpers/create-pagination-and-sort-filter";

const commentsController = {

    async getComments(
        req: RequestWithParamsAndQuery<IdType, SortingAndPaginationParamsType>,
        res: Response<PaginationResponse<CommentViewModel>>
    ) {

        const postId: string = req.params.id;

        const resultCheckPostId: ResultType<string | null> = await commentsService
            .checkPostId(postId);

        if (resultCheckPostId.status !== ResultStatusType.Success) {
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


        const foundComments: PaginationResponse<WithId<CommentDbType>> | null = await commentQueryRepository
            .findComments(paginationAndSortFilter, postId);
    },

    async getComment(
        req: RequestWithParams<IdType>,
        res: Response<CommentViewModel>
    ) {

        const foundComment: WithId<CommentDbType> | null = await commentQueryRepository
            .findComment(req.params.id);

        if (!foundComment) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return
        }

        const commentViewModel: CommentViewModel = commentQueryRepository
            .mapToViewModel(foundComment)

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(commentViewModel);
    },
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

        if (resultCreateComment.status !== ResultStatusType.Created) {
            res
                .sendStatus(mapResultStatusToHttpStatus(resultCreateComment.status));

            return;
        }

        const createdComment: CommentViewModel = await commentQueryRepository
            .findComment(resultCreateComment.data!);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdComment);
    },
    async updateComment(
        req: Request,
        res: Response
    ) {

    },
    async deleteComment(
        req: Request,
        res: Response
    ) {

    }
};

export {commentsController};