import {body} from "express-validator";

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



export {
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
};