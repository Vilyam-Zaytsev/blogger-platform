import {body, query} from "express-validator";

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

const blogPageNumberInputValidator =
    query('pageNumber')
        .optional()
        .isInt({min: 1})
        .withMessage('The "pageNumber" field must be a positive integer.');

const blogPageSizeInputValidator =
    query('pageSize')
        .optional()
        .isInt({min: 1})
        .withMessage('The "pageSize" field must be a positive integer.');

const blogSortByInputValidator =
    query('sortBy')
        .optional()
        .isString()
        .withMessage('The "sortBy" field must be of the string type.');

const blogSortDirectionInputValidator =
    query('sortDirection')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('The "SortDirection" field must contain "asc" | "desc".');

const blogSearchNameTermInputValidator =
    query('searchNameTerm')
        .optional()
        .isString()
        .withMessage('The "searchNameTerm" field must be of the string type.');

export {
    blogNameInputValidator,
    blogDescriptionInputValidator,
    blogWebsiteUrlInputValidator,
    blogPageNumberInputValidator,
    blogPageSizeInputValidator,
    blogSortByInputValidator,
    blogSortDirectionInputValidator,
    blogSearchNameTermInputValidator
};