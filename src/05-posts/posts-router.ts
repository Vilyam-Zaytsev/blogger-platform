import {Router} from "express";
import {postsController} from './posts-controller';
import {baseAuthGuard} from "../01-auth/api/guards/base-auth-guard";
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
import {commentsController} from "../06-comments/comments-controller";
import {accessTokenGuard} from "../01-auth/api/guards/access-token-guard";
import {commentContentInputValidator} from "../06-comments/middlewares/comment-validators";

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
    baseAuthGuard,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputValidator,
    inputCheckErrorsMiddleware,
    postsController.createPost
);
postsRouter.post(`/:id${SETTINGS.PATH.COMMENTS}`,
    accessTokenGuard,
    commentContentInputValidator,
    inputCheckErrorsMiddleware,
    commentsController.createComment
);
postsRouter.put('/:id',
    baseAuthGuard,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputValidator,
    inputCheckErrorsMiddleware,
    postsController.updatePost
);
postsRouter.delete('/:id',
    baseAuthGuard,
    postsController.deletePost
);

export {postsRouter};