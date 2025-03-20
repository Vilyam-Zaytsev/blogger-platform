import {CommentatorInfo} from "../../db/mongo-db/models/comment-model";

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
