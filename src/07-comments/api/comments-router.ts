import {Router} from "express";
import {CommentsController} from "../comments-controller";
import {commentContentInputValidator} from "./middlewares/comment-validators";
import {inputCheckErrorsMiddleware} from "../../common/middlewares/input-check-errors-middleware";
import {accessTokenGuard} from "../../01-auth/api/guards/access-token-guard";
import {container} from "../../composition-root";

const commentsRouter = Router();
const commentsController: CommentsController = container.get(CommentsController);

commentsRouter.get('/:id',
    commentsController.getComment.bind(commentsController)
);
commentsRouter.put('/:id',
    accessTokenGuard,
    commentContentInputValidator,
    inputCheckErrorsMiddleware,
    commentsController.updateComment.bind(commentsController)
);
commentsRouter.delete('/:id',
    accessTokenGuard,
    commentsController.deleteComment.bind(commentsController)
);

export {commentsRouter};
