import {Router} from "express";
import {postsController} from './postsController';
import {authMiddleware} from "../common/middlewares/authorization-middleware";
import {
    postBlogIdInputValidator,
    postContentInputValidator,
    postShortDescriptionInputValidator,
    postTitleInputValidator
} from "./middlewares/postValidators";
import {inputCheckErrorsMiddleware} from "../common/middlewares/input-check-errors-middleware";
import {
    pageNumberInputValidator,
    pageSizeInputValidator, sortByInputValidator, sortDirectionInputValidator
} from "../common/middlewares/query-parameters-validator";

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
postsRouter.post('/',
    authMiddleware,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputValidator,
    inputCheckErrorsMiddleware,
    postsController.createAndInsertPost
);
postsRouter.put('/:id',
    authMiddleware,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputValidator,
    inputCheckErrorsMiddleware,
    postsController.updatePost
);
postsRouter.delete('/:id',
    authMiddleware,
    postsController.deletePost
);

export {postsRouter};