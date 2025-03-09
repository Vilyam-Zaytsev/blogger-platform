import {Router} from "express";
import {commentsController} from "../comments-controller";
import {commentContentInputValidator} from "./middlewares/comment-validators";
import {inputCheckErrorsMiddleware} from "../../common/middlewares/input-check-errors-middleware";
import {accessTokenGuard} from "../../01-auth/api/guards/access-token-guard";

const commentsRouter = Router();

commentsRouter.get('/:id', commentsController.getComment);
commentsRouter.put('/:id',
    accessTokenGuard,
    commentContentInputValidator,
    inputCheckErrorsMiddleware,
    commentsController.updateComment
);
commentsRouter.delete('/:id',
    accessTokenGuard,
    commentsController.deleteComment
);

export {commentsRouter};
