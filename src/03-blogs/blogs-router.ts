import {Router} from "express";
import {blogsController} from './blogs-controller';
import {
    blogDescriptionInputValidator,
    blogNameInputValidator,
    blogWebsiteUrlInputValidator
} from "./middlewares/blog-validators";
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
import {
    postContentInputValidator,
    postShortDescriptionInputValidator,
    postTitleInputValidator
} from "../04-posts/middlewares/post-validators";

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
blogsRouter.post('/',
    baseAuthMiddleware,
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.createBlog
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
blogsRouter.get(`/:id${SETTINGS.PATH.POSTS}`,
    pageNumberInputValidator,
    pageSizeInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.getPosts
);
blogsRouter.post(`/:id${SETTINGS.PATH.POSTS}`,
    baseAuthMiddleware,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.createPost
);

export {blogsRouter};