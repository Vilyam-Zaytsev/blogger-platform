import {Router} from "express";
import {blogsController} from '../controllers/blogsController';
import {
    blogDescriptionInputValidator,
    blogNameInputValidator,
    blogWebsiteUrlInputValidator
} from "../middlewares/blog-middlewares/blogValidators";
import {inputCheckErrorsMiddleware} from "../middlewares/global-middlewares/input-check-errors-middleware";
import {authMiddleware} from "../middlewares/global-middlewares/authorization-middleware";

const blogsRouter = Router();

blogsRouter.get('/', blogsController.getBlogs);
blogsRouter.get('/:id', blogsController.getBlog);
blogsRouter.post('/',
    authMiddleware,
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.createBlog
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