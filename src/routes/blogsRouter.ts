import {Router} from "express";
import {blogsController} from '../controllers/blogsController';
import {
    blogDescriptionInputValidator,
    blogNameInputValidator,
    blogWebsiteUrlInputValidator
} from "../middlewares/blog-middlewares/blogValidators";
import {inputCheckErrorsMiddleware} from "../middlewares/global-middlewares/input-check-errors-middleware";
import {authMiddleware} from "../middlewares/global-middlewares/authorization-middleware";
import {
    pageNumberInputValidator,
    pageSizeInputValidator,
    searchNameTermInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator
} from "../middlewares/global-middlewares/query-parameters-validator";
import {SETTINGS} from "../settings";
import {postsController} from "../controllers/postsController";
import {
    postBlogIdInputValidator,
    postContentInputValidator,
    postShortDescriptionInputValidator,
    postTitleInputValidator
} from "../middlewares/post-middlewares/postValidators";
import {checkBlogId} from "../middlewares/global-middlewares/checkBlogId";

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
    checkBlogId,
    pageNumberInputValidator,
    pageSizeInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator,
    postBlogIdInputValidator,
    inputCheckErrorsMiddleware,
    postsController.getPosts
);
blogsRouter.post(`/:id${SETTINGS.PATH.POSTS}`,
    authMiddleware,
    checkBlogId,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputValidator,
    inputCheckErrorsMiddleware,
    postsController.createAndInsertPost
);
blogsRouter.post('/',
    authMiddleware,
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.createAndInsertBlog
);
blogsRouter.put('/:id',
    authMiddleware,
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.updateBlog
);
blogsRouter.delete('/:id',
    authMiddleware,
    blogsController.deleteBlog
);

export {blogsRouter};