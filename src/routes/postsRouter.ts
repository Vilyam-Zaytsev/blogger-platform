import {Router} from "express";
import {postsController} from '../controllers/postsController';
import {authMiddleware} from "../middlewares/global-middlewares/authorization-middleware";
import {
    postBlogIdInputValidator,
    postContentInputValidator,
    postShortDescriptionInputValidator,
    postTitleInputValidator
} from "../middlewares/post-middlewares/postValidators";
import {inputCheckErrorsMiddleware} from "../middlewares/global-middlewares/input-check-errors-middleware";

const postsRouter = Router();

postsRouter.get('/', postsController.getPosts);
postsRouter.get('/:id', postsController.getPost);
postsRouter.post('/',
    authMiddleware,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputValidator,
    inputCheckErrorsMiddleware,
    postsController.createPost
);
postsRouter.put('/:id',
    authMiddleware,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    inputCheckErrorsMiddleware,
    postsController.updatePost
);
postsRouter.delete('/:id',
    authMiddleware,
    postsController.deletePost
);

export {postsRouter};