import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
import {LikeInfoViewModel, LikeStatus} from "../../07-likes/like-entity";

type CommentatorInfo = {
    userId: string,
    userLogin: string
};

type Reactions = {
    likeCount: number,
    dislikeCount: number,
    [key: string]: number;
};

type Comment = {
    postId: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    reactions: Reactions,
    createdAt: string
};

type CommentInputModel = {
    content: string
};

type CommentViewModel = {
    id: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    likesInfo: LikeInfoViewModel,
    createdAt: string
};

type CommentMethods = typeof commentMethods;
type CommentStatics = typeof commentStatics;

type CommentModel = Model<Comment, {}, CommentMethods> & CommentStatics;
type CommentDocument = HydratedDocument<Comment, CommentMethods>;

const commentatorInfoSchema = new Schema<CommentatorInfo>({

    userId: {
        type: String,
        required: true
    },
    userLogin: {
        type: String,
        required: true
    }
}, {_id: false});

const reactionSchema = new Schema<Reactions>({
    likeCount: {
        type: Number,
        required: true,
        default: 0
    },
    dislikeCount: {
        type: Number,
        required: true,
        default: 0
    }
}, {_id: false});

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
    reactions: {
        type: reactionSchema,
        required: true
    },
    createdAt: {
        type: String,
        required: true
    }
});

const commentMethods = {

    updateReactionsCount(currentReaction: LikeStatus, reaction: LikeStatus) {

        const currentReactionKey: string = `${currentReaction.toLowerCase()}Count`;

        (this as CommentDocument).reactions[currentReactionKey] -= 1;

        switch (reaction) {

            case LikeStatus.None:

                return;

            case LikeStatus.Dislike:
                (this as CommentDocument).reactions.dislikeCount += 1;

                return;
            case LikeStatus.Like:
                (this as CommentDocument).reactions.likeCount += 1;

                return;
        }


    }
};

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
            reactions: {
                likeCount: 0,
                dislikeCount: 0
            },
            createdAt: new Date().toISOString()
        };

        return new CommentModel(comment) as CommentDocument;
    }
};

commentSchema.methods = commentMethods;
commentSchema.statics = commentStatics;

const CommentModel: CommentModel = mongoose.model<Comment, CommentModel>('Comment', commentSchema);

export {
    Comment,
    CommentatorInfo,
    Reactions,
    CommentInputModel,
    CommentViewModel,
    CommentModel,
    CommentDocument
};


