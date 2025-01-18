import {CommentatorInfo} from "./commentator-info-type";

type CommentDbType = {
    postId: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string
};

export {CommentDbType};