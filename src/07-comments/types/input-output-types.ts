import {CommentatorInfo} from "../../archive/models/comment-model";

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
