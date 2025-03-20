import {CommentatorInfo} from "../../db/mongo-db/models/comment-model";

type CommentDbType = {
    postId: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string
};

export {CommentDbType};