import {Router} from "express";
import {blogsController} from '../controllers/blogsController';
import {
    blogDescriptionInputValidator,
    blogNameInputValidator,
    blogWebsiteUrlInputValidator
} from "../middlewares/blog-middlewares/blogValidators";
import {inputCheckErrorsMiddleware} from "../middlewares/global-middlewares/inputCheckErrorsMiddleware";

const blogsRouter = Router();

blogsRouter.get('/', blogsController.getBlogs);
blogsRouter.get('/:id', blogsController.getBlog);
blogsRouter.post('/',
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    inputCheckErrorsMiddleware,
    blogsController.createBlog);

blogsRouter.put('/:id', blogsController.updateBlog);
blogsRouter.delete('/:id', blogsController.deleteBlog);

export {blogsRouter};