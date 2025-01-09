import {BlogInputModel} from "../../../blogs/types/input-output-types";
import {PostInputModel} from "../../../posts/types/input-output-types";
import {UserInputModel} from "../../../users/types/input-output-types";

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
