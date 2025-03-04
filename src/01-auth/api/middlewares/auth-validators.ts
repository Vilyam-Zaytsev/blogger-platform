import {body} from "express-validator";

const authConfirmationCodeInputValidator =
    body('code')
        .isString()
        .withMessage('The "code" field must be of the string type.')
        .trim()
        .isLength({min: 1, max: 1000})
        .withMessage('The length of the "code" field should be from 1 to 1000.');

export {authConfirmationCodeInputValidator};