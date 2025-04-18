import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
import {ObjectId} from "mongodb";

enum LikeStatus {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike'
}

type Like = {
    status: LikeStatus,
    userId: string,
    parentId: string,
    createdAt: Date
};

type LikeInputModel = {
    likeStatus: LikeStatus
};

type LikeInfoViewModel = {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus
};

type GroupedLikesByPostId = {
    postId: ObjectId,
    recentLikes: LikeDocument[]
};

type MapLikerInfo = {
    likerReaction: LikeStatus,
    likerId: string | null
};

type LikeMethods = typeof likeMethods;
type LikeStatics = typeof likeStatics;

type LikeModel = Model<Like, {}, LikeMethods> & LikeStatics;
type LikeDocument = HydratedDocument<Like, LikeMethods>;

const likeSchema = new Schema<Like, LikeModel, LikeMethods>({

    status: {
        type: String,
        required: true,
        enum: Object.values(LikeStatus),
        default: LikeStatus.None
    },
    userId: {
        type: String,
        required: true
    },
    parentId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
});

const likeMethods = {


};

const likeStatics: any = {

    createLike(
        reaction: LikeStatus,
        userId: string,
        parentId: string
    ): LikeDocument {

        const like: Like = {
            status: reaction,
            userId,
            parentId,
            createdAt: new Date()
        };

        return new LikeModel(like);
    }
};

likeSchema.methods = likeMethods;
likeSchema.statics = likeStatics;

const LikeModel: LikeModel = mongoose.model<Like, LikeModel>('Like', likeSchema);

export {
    Like,
    LikeStatus,
    LikeInputModel,
    LikeInfoViewModel,
    GroupedLikesByPostId,
    MapLikerInfo,
    LikeModel,
    LikeDocument,
};
