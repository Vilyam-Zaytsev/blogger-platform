import {CommentatorInfo} from "../../archive/models/comment-model";

type CommentDbType = {
    postId: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string
};

export {CommentDbType};