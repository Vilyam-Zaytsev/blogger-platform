import {body} from "express-validator";
import {LikeStatus} from "../like-entity";

const likeStatusInputValidator =
    body('likeStatus')
        .isString()
        .withMessage('The "likeStatus" field should be a string.')
        .isIn(Object.values(LikeStatus))
        .withMessage(`The "likeStatus" field must contain one of the values: ${Object.values(LikeStatus).join(', ')}`)

export {
    likeStatusInputValidator,
};