import {body} from "express-validator";

const commentContentInputValidator =
    body('content')
        .isString()
        .withMessage('The "content" field must be of the string type.')
        .trim()
        .isLength({min: 20, max: 300})
        .withMessage('The length of the "content" field should be from 20 to 300.');

export {
    commentContentInputValidator,
};