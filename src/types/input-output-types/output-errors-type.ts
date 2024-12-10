import {BlogInputModel} from "./blogs-types";
import {PostInputModel} from "./posts-types";

type FieldNameType = keyof BlogInputModel | keyof PostInputModel;

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
