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
import {container} from "../../composition-root";

const blogsRouter = Router();
const blogsController: BlogsController = container.get(BlogsController);

blogsRouter.get('/',
    pageNumberInputValidator,
    pageSizeInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator,
    searchNameTermInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.getBlogs.bind(blogsController)
);
blogsRouter.get('/:id',
    blogsController.getBlog.bind(blogsController)
);
blogsRouter.post('/',
    baseAuthGuard,
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.createBlog.bind(blogsController)
);
blogsRouter.put('/:id',
    baseAuthGuard,
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.updateBlog.bind(blogsController)
);
blogsRouter.delete('/:id',
    baseAuthGuard,
    blogsController.deleteBlog.bind(blogsController)
);
blogsRouter.get(`/:id${SETTINGS.PATH.POSTS}`,
    pageNumberInputValidator,
    pageSizeInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.getPosts.bind(blogsController)
);
blogsRouter.post(`/:id${SETTINGS.PATH.POSTS}`,
    baseAuthGuard,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.createPost.bind(blogsController)
);

export {blogsRouter};