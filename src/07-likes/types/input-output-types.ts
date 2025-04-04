import {LikeStatus} from "../like-entity";

type LikeInputModel = {
    likeStatus: LikeStatus
};

type LikeInfoViewModel = {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus
};

export {
    LikeInputModel,
    LikeInfoViewModel
};