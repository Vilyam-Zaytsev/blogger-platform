import {CommentatorInfo} from "./commentator-info-type";

type CommentInputModel = {
    content: string
};

type CommentViewModel = {
    id: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string
};



export {
    CommentInputModel,
    CommentViewModel
};
