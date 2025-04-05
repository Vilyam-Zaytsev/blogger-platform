import mongoose, {HydratedDocument, Model, Schema} from "mongoose";

enum LikeStatus {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike'
}

type Like = {
    status: LikeStatus,
    userId: string,
    parentId: string
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
    }
});

const likeMethods: any = {


};

const likeStatics: any = {


};

likeSchema.methods = likeMethods;
likeSchema.statics = likeStatics;

const LikeModel: LikeModel = mongoose.model<Like, LikeModel>('Like', likeSchema);

export {
    Like,
    LikeStatus,
    LikeModel,
    LikeDocument,
};
