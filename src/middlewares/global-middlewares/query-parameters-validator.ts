import {query} from "express-validator";

const pageNumberInputValidator =
    query('pageNumber')
        .optional()
        .isInt({min: 1})
        .withMessage('The "pageNumber" field must be a positive integer.');

const pageSizeInputValidator =
    query('pageSize')
        .optional()
        .isInt({min: 1})
        .withMessage('The "pageSize" field must be a positive integer.');

const sortByInputValidator =
    query('sortBy')
        .optional()
        .isString()
        .withMessage('The "sortBy" field must be of the string type.');

const sortDirectionInputValidator =
    query('sortDirection')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('The "SortDirection" field must contain "asc" | "desc".');

const searchNameTermInputValidator =
    query('searchNameTerm')
        .optional()
        .isString()
        .withMessage('The "searchNameTerm" field must be of the string type.');

export {
    pageNumberInputValidator,
    pageSizeInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator,
    searchNameTermInputValidator
}