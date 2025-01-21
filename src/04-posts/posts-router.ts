import {Router} from "express";
import {postsController} from './posts-controller';
import {baseAuthMiddleware} from "../common/middlewares/base-authorization-middleware";
import {
    postBlogIdInputValidator,
    postContentInputValidator,
    postShortDescriptionInputValidator,
    postTitleInputValidator
} from "./middlewares/post-validators";
import {inputCheckErrorsMiddleware} from "../common/middlewares/input-check-errors-middleware";
import {
    pageNumberInputValidator,
    pageSizeInputValidator, sortByInputValidator, sortDirectionInputValidator
} from "../common/middlewares/query-parameters-validator";
import {SETTINGS} from "../common/settings";
import {commentsController} from "../05-comments/comments-controller";
import {bearerAuthorizationMiddleware} from "../common/middlewares/bearer-authorization-middleware";
import {commentContentInputValidator} from "../05-comments/middlewares/comment-validators";

const postsRouter = Router();

postsRouter.get('/',
    pageNumberInputValidator,
    pageSizeInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator,
    inputCheckErrorsMiddleware,
    postsController.getPosts
);
postsRouter.get('/:id', postsController.getPost);
postsRouter.get(`/:id${SETTINGS.PATH.COMMENTS}`,
    pageNumberInputValidator,
    pageSizeInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator,
    inputCheckErrorsMiddleware,
    commentsController.getComments
);
postsRouter.post('/',
    baseAuthMiddleware,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputValidator,
    inputCheckErrorsMiddleware,
    postsController.createAndInsertPost
);
postsRouter.post(`/:id${SETTINGS.PATH.COMMENTS}`,
    bearerAuthorizationMiddleware,
    commentContentInputValidator,
    inputCheckErrorsMiddleware,
    commentsController.createAndInsertComment
);
postsRouter.put('/:id',
    baseAuthMiddleware,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputValidator,
    inputCheckErrorsMiddleware,
    postsController.updatePost
);
postsRouter.delete('/:id',
    baseAuthMiddleware,
    postsController.deletePost
);

export {postsRouter};