import {BlogInputModel} from "../../../03-blogs/types/input-output-types";
import {PostInputModel} from "../../../04-posts/types/input-output-types";
import {UserInputModel} from "../../../02-users/types/input-output-types";

type FieldNameType =
    keyof BlogInputModel
    | keyof PostInputModel
    | keyof UserInputModel
    | 'loginOrEmail'
    | 'loginOrEmailOrPassword';

type OutputErrorsType = {
    errorsMessages: {
        field: FieldNameType
        message: string,
    }[]
};

export {
    FieldNameType,
    OutputErrorsType
};
