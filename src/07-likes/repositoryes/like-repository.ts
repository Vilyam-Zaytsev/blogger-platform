import {injectable} from "inversify";
import {LikeDocument, LikeModel} from "../like-entity";

@injectable()
class LikeRepository {

    async findLikeByUserIdAndParentId(userId: string, parentId: string): Promise<LikeDocument | null> {

        return LikeModel
            .findOne({userId, parentId})
    }
}

export {LikeRepository};