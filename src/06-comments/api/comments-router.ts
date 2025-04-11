import {Router} from "express";
import {CommentsController} from "../comments-controller";
import {commentContentInputValidator} from "./middlewares/comment-validators";
import {inputCheckErrorsMiddleware} from "../../common/middlewares/input-check-errors-middleware";
import {accessTokenGuard} from "../../01-auth/api/guards/access-token-guard";
import {container} from "../../composition-root";
import {SETTINGS} from "../../common/settings";
import {likeStatusInputValidator} from "../../07-likes/middlewares/like-validators";
import {authGuard} from "../../01-auth/api/guards/auth-guard";

const commentsRouter = Router();
const commentsController: CommentsController = container.get(CommentsController);

commentsRouter.get('/:id',
    authGuard,
    commentsController.getComment.bind(commentsController)
);
commentsRouter.put('/:id',
    accessTokenGuard,
    commentContentInputValidator,
    inputCheckErrorsMiddleware,
    commentsController.updateComment.bind(commentsController)
);
commentsRouter.put(`/:id${SETTINGS.PATH.LIKE_STATUS}`,
    accessTokenGuard,
    likeStatusInputValidator,
    inputCheckErrorsMiddleware,
    commentsController.updateCommentReactions.bind(commentsController)
);
commentsRouter.delete('/:id',
    accessTokenGuard,
    commentsController.deleteComment.bind(commentsController)
);

export {commentsRouter};
