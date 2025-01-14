import {Router} from "express";
import {blogsController} from './blogsController';
import {
    blogDescriptionInputValidator,
    blogNameInputValidator,
    blogWebsiteUrlInputValidator
} from "./middlewares/blogValidators";
import {inputCheckErrorsMiddleware} from "../common/middlewares/input-check-errors-middleware";
import {baseAuthMiddleware} from "../common/middlewares/base-authorization-middleware";
import {
    pageNumberInputValidator,
    pageSizeInputValidator,
    searchNameTermInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator
} from "../common/middlewares/query-parameters-validator";
import {SETTINGS} from "../common/settings";
import {postsController} from "../04-posts/postsController";
import {
    postContentInputValidator,
    postShortDescriptionInputValidator,
    postTitleInputValidator
} from "../04-posts/middlewares/postValidators";

const blogsRouter = Router();

blogsRouter.get('/',
    pageNumberInputValidator,
    pageSizeInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator,
    searchNameTermInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.getBlogs
);
blogsRouter.get('/:id', blogsController.getBlog);
blogsRouter.get(`/:id${SETTINGS.PATH.POSTS}`,
    pageNumberInputValidator,
    pageSizeInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator,
    inputCheckErrorsMiddleware,
    postsController.getPosts
);
blogsRouter.post(`/:id${SETTINGS.PATH.POSTS}`,
    baseAuthMiddleware,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    inputCheckErrorsMiddleware,
    postsController.createAndInsertPost
);
blogsRouter.post('/',
    baseAuthMiddleware,
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.createAndInsertBlog
);
blogsRouter.put('/:id',
    baseAuthMiddleware,
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.updateBlog
);
blogsRouter.delete('/:id',
    baseAuthMiddleware,
    blogsController.deleteBlog
);

export {blogsRouter};