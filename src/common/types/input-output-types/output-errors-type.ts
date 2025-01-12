import {BlogInputModel} from "../../../blogs/types/input-output-types";
import {PostInputModel} from "../../../posts/types/input-output-types";
import {UserInputModel} from "../../../users/types/input-output-types";

type FieldNameType =
    keyof BlogInputModel
    | keyof PostInputModel
    | keyof UserInputModel
    | 'loginOrEmail'
    | 'loginOrEmailOrPassword';

type OutputErrorsType = {
    errorsMessage: {
        field: FieldNameType
        message: string,
    }[]
};

export {
    FieldNameType,
    OutputErrorsType
};
