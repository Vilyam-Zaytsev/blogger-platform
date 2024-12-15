import {body} from "express-validator";

const postTitleInputValidator =
    body('title')
        .isString().withMessage('The "title" field must be of the string type.')
        .trim()
        .isLength({min: 1, max: 30}).withMessage('The length of the "title" field should be from 1 to 30.');

const postShortDescriptionInputValidator =
    body('shortDescription')
        .isString().withMessage('The "shortDescription" field must be of the string type.')
        .trim()
        .isLength({min: 1, max: 100}).withMessage('The length of the "shortDescription" field should be from 1 to' +
        ' 100.');

const postContentInputValidator =
    body('content')
        .isString().withMessage('The "content" field must be of the string type.')
        .trim()
        .isLength({min: 1, max: 1000}).withMessage('The length of the "content" field should be from 1 to 1000.')

export {
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator
};