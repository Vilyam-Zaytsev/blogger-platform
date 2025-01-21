import {Router} from "express";
import {commentsController} from "./comments-controller";
import {commentContentInputValidator} from "./middlewares/comment-validators";
import {inputCheckErrorsMiddleware} from "../common/middlewares/input-check-errors-middleware";
import {bearerAuthorizationMiddleware} from "../common/middlewares/bearer-authorization-middleware";

const commentsRouter = Router();

commentsRouter.get('/:id', commentsController.getComment);
commentsRouter.put('/:id',
    bearerAuthorizationMiddleware,
    commentContentInputValidator,
    inputCheckErrorsMiddleware,
    commentsController.updateComment
);
commentsRouter.delete('/:id',
    bearerAuthorizationMiddleware,
    commentsController.deleteComment
);

export {commentsRouter};
