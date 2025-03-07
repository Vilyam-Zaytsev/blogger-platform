import {Router} from "express";
import {BlogsController} from '../blogs-controller';
import {
    blogDescriptionInputValidator,
    blogNameInputValidator,
    blogWebsiteUrlInputValidator
} from "./middlewares/blog-validators";
import {inputCheckErrorsMiddleware} from "../../common/middlewares/input-check-errors-middleware";
import {baseAuthGuard} from "../../01-auth/api/guards/base-auth-guard";
import {
    pageNumberInputValidator,
    pageSizeInputValidator,
    searchNameTermInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator
} from "../../common/middlewares/query-parameters-validator";
import {SETTINGS} from "../../common/settings";
import {
    postContentInputValidator,
    postShortDescriptionInputValidator,
    postTitleInputValidator
} from "../../06-posts/api/middlewares/post-validators";

const blogsController: BlogsController = new BlogsController();

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
    baseAuthGuard,
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.createBlog
);
blogsRouter.put('/:id',
    baseAuthGuard,
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.updateBlog
);
blogsRouter.delete('/:id',
    baseAuthGuard,
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
    baseAuthGuard,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.createPost
);

export {blogsRouter};