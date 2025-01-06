import {BlogInputModel} from "./blogs-types";
import {PostInputModel} from "./posts-types";
import {UserInputModel} from "./user-types";

type FieldNameType = keyof BlogInputModel | keyof PostInputModel | keyof UserInputModel;

type OutputErrorsType = {
    errorsMessage: {
        message: string,
        field: FieldNameType
    }[]
};

export {
    FieldNameType,
    OutputErrorsType
};
