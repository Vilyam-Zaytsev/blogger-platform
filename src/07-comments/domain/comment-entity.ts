import mongoose, {HydratedDocument, Model, Schema} from "mongoose";

type CommentatorInfo = {
    userId: string,
    userLogin: string
};

type Comment = {
    postId: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string
};

type CommentStatics = typeof commentStatics;

type CommentModel = Model<Comment, {}> & CommentStatics;
type CommentDocument = HydratedDocument<Comment>;

const commentatorInfoSchema = new Schema<CommentatorInfo>({

    userId: {
        type: String,
        required: true
    },
    userLogin: {
        type: String,
        required: true
    }
}, { _id: false });

const commentSchema = new Schema<Comment, CommentModel>({

    postId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    commentatorInfo: {
        type: commentatorInfoSchema,
        required: true

    },
    createdAt: {
        type: String,
        required: true
    }
});

const commentStatics: any = {

    createComment(
        content: string,
        postId: string,
        commentatorId: string,
        commentatorLogin: string
    ): CommentDocument {

        const commentatorInfo: CommentatorInfo = {
            userId: commentatorId,
            userLogin: commentatorLogin
        };

        const comment: Comment = {
            postId,
            content,
            commentatorInfo,
            createdAt: new Date().toISOString()
        };

        return new CommentModel(content) as CommentDocument;
    }
}

const CommentModel: CommentModel = mongoose.model<Comment, CommentModel>('Comment', commentSchema);

export {
    Comment,
    CommentatorInfo,
    CommentModel,
    CommentDocument
};


