import {Schema} from "mongoose";

type Reactions = {
    likeCount: number,
    dislikeCount: number,
    [key: string]: number;
};

const reactionsSchema = new Schema<Reactions>({
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

export {
    Reactions,
    reactionsSchema
};