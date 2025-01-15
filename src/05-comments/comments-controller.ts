import {Request, Response} from "express";
import {RequestWithParamsAndBody} from "../common/types/input-output-types/request-types";
import {IdType} from "../common/types/input-output-types/id-type";
import {CommentInputModel, CommentViewModel} from "./types/input-output-types";

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

        // const idCreatedComment: string | null = await co
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