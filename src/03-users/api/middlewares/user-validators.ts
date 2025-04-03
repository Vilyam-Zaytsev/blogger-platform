import {body} from "express-validator";

const userLoginInputValidator =
    body('login')
        .isString()
        .withMessage('The "login" field must be of the string type.')
        .trim()
        .isLength({min: 3, max: 10})
        .withMessage('The length of the "login" field should be from 3 to 10.')
        .matches(/^[a-zA-Z0-9_-]*$/)
        .withMessage('The "login" field can contain only letters, numbers, hyphens, and underscores.');

const userEmailInputValidator =
    body('email')
        .isString()
        .withMessage('The "email" field must be of the string type.')
        .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
        .withMessage('The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.');

const userLoginOrEmailInputValidator =
    body('loginOrEmail')
        .isString()
        .withMessage('The "loginOrEmail" field must be of the string type.')
        .trim()
        .isLength({min: 3, max: 100})
        .withMessage('The length of the "loginOrEmail" field should be from 3 to 100.')

const userPasswordInputValidator =
    body('password')
        .isString()
        .withMessage('The "password" field must be of the string type.')
        .trim()
        .isLength({min: 6, max: 20})
        .withMessage('The length of the "password" field should be from 6 to 20.')

const userNewPasswordInputValidator =
    body('newPassword')
        .isString()
        .withMessage('The "password" field must be of the string type.')
        .trim()
        .isLength({min: 6, max: 20})
        .withMessage('The length of the "password" field should be from 6 to 20.')


export {
    userLoginInputValidator,
    userEmailInputValidator,
    userLoginOrEmailInputValidator,
    userPasswordInputValidator,
    userNewPasswordInputValidator
};