import {body, param} from "express-validator";
import {Request} from "express";
import {BlogDbType} from "../../types/db-types/blog-db-type";
import {qBlogsRepository} from "../../repositoryes/qBlogs-repository";


const blogNameInputValidator =
    body('name')
        .isString()
        .withMessage('The "name" field must be of the string type.')
        .trim()
        .isLength({min: 1, max: 15})
        .withMessage('The length of the "name" field should be from 1 to 15.');

const blogDescriptionInputValidator =
    body('description')
        .isString()
        .withMessage('The "description" field must be of the string type.')
        .trim()
        .isLength({min: 1, max: 500})
        .withMessage('The length of the "description" field should be from 1 to 500.');

const blogWebsiteUrlInputValidator =
    body('websiteUrl')
        .isString()
        .withMessage('The "websiteUrl" field must be of the string type.')
        .trim()
        .isLength({min: 1, max: 100})
        .withMessage('The length of the "description" field should be from 1 to 100.')
        .isURL()
        .withMessage('Invalid URL. The field must start with "https://" and match the pattern:' +
            ' "https://example.com/path".');
const paramsIdInputValidator =
    param('id')
        .isString()
        .withMessage('The "blogId" field must be of the string type.')
        .trim()
        .custom(async (id, {req}) => {
            const blog: BlogDbType | null = await qBlogsRepository.findBlog(id);
            if (!blog) {
                throw new Error('A blog with such an ID does not exist.');
            }
            req.body.blogId = id

            return true;
        })
        .withMessage('A blog with such an ID does not exist.');

export {
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    paramsIdInputValidator
};