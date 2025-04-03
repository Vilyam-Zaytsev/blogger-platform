import {body} from "express-validator";

import {BlogsRepository} from "../../../04-blogs/repositoryes/blogs-repository";
import {BlogDocument} from "../../../04-blogs/domain/blog-entity";

const blogsRepository: BlogsRepository = new BlogsRepository();

const postTitleInputValidator =
    body('title')
        .isString()
        .withMessage('The "title" field must be of the string type.')
        .trim()
        .isLength({min: 1, max: 30})
        .withMessage('The length of the "title" field should be from 1 to 30.');

const postShortDescriptionInputValidator =
    body('shortDescription')
        .isString()
        .withMessage('The "shortDescription" field must be of the string type.')
        .trim()
        .isLength({min: 1, max: 100})
        .withMessage('The length of the "shortDescription" field should be from 1 to' +
        ' 100.');

const postContentInputValidator =
    body('content')
        .isString()
        .withMessage('The "content" field must be of the string type.')
        .trim()
        .isLength({min: 1, max: 1000})
        .withMessage('The length of the "content" field should be from 1 to 1000.');

const postBlogIdInputValidator =
    body('blogId')
        .isString()
        .withMessage('The "blogId" field must be of the string type.')
        .trim()
        .custom(async (blogId) => {
            const blog: BlogDocument | null = await blogsRepository.findBlog(blogId);
            if (!blog) {
                throw new Error('A blog with such an ID does not exist.');
            }
            return true;
        })
        .withMessage('A blog with such an ID does not exist.');

export {
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputValidator,
};