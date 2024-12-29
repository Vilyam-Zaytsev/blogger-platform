import {body, query} from "express-validator";
import {qBlogsRepository} from "../../repositoryes/qBlogs-repository";
import {BlogDbType} from "../../types/db-types/blog-db-type";

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

const postBlogIdInputBodyValidator =
    body('blogId')
        .isString()
        .withMessage('The "blogId" field must be of the string type.')
        .trim()
        .custom(async (blogId) => {
            const blog: BlogDbType | null = await qBlogsRepository.findBlog(blogId);
            if (!blog) {
                throw new Error('A blog with such an ID does not exist.');
            }
            return true;
        })
        .withMessage('A blog with such an ID does not exist.');

const postBlogIdInputQueryValidator =
    query('blogId')
        .isString()
        .withMessage('The "BlogId" field passed to the query parameter must be of a string type.')
        .trim()
        .custom(async (blogId) => {
            const blog: BlogDbType | null = await qBlogsRepository.findBlog(blogId);
            if (!blog) {
                throw new Error('There is no blog with the ID passed to the query parameter.');
            }
            return true;
        })
        .withMessage('There is no blog with the ID passed to the query parameter.');

export {
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputBodyValidator,
    postBlogIdInputQueryValidator
};