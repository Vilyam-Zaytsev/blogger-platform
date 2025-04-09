import {injectable} from "inversify";
import {LikeDocument, LikeModel} from "../like-entity";

@injectable()
class LikeRepository {

    async findLikesByUserId(userId: string): Promise<LikeDocument[]> {

        return LikeModel
            .find({userId});
    }

    async findLikeByUserIdAndParentId(userId: string, parentId: string): Promise<LikeDocument | null> {

        return LikeModel
            .findOne({userId, parentId});
    }

    async saveLike(likeDocument: LikeDocument): Promise<string> {

        const result = await likeDocument
            .save();

        return String(result._id);
    }

    async deleteLike(id: string): Promise<boolean> {

        const result: LikeDocument | null = await LikeModel
            .findByIdAndDelete(id);

        return !!result;
    }
}

export {LikeRepository};