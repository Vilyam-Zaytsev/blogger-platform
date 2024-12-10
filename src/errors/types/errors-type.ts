import {BlogInputModel} from "../../blogs/types/blogs-types";
import {PostInputModel} from "../../posts/types/posts-types";

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
