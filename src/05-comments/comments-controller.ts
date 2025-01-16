import {Request, Response} from "express";
import {RequestWithParamsAndBody} from "../common/types/input-output-types/request-types";
import {IdType} from "../common/types/input-output-types/id-type";
import {CommentInputModel, CommentViewModel} from "./types/input-output-types";
import {ResultType} from "../common/types/result-types/result-type";
import {commentsService} from "./comments-service";
import {ResultStatusType} from "../common/types/result-types/result-status-type";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {SETTINGS} from "../common/settings";
import {commentQueryRepository} from "./repositoryes/comment-query-repository";

const commentsController = {
    async getComments(
        req: Request,
        res: Response
    ) {

    },
    async getComment(
        req: Request,
        res: Response
    ) {

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