import {injectable} from "inversify";
import {Like, LikeDocument, LikeModel} from "../like-entity";
import {WithId} from "mongodb";

@injectable()
class LikesRepository {

    async findLikesByUserId(userId: string): Promise<LikeDocument[]> {

        return LikeModel
            .find({userId});
    }

    async findLikesByParentId(parentId: string):Promise<LikeDocument[]> {

        return LikeModel
            .find({parentId});
    }

    async findLikeByUserIdAndParentId(userId: string, parentId: string): Promise<LikeDocument | null> {

        return LikeModel
            .findOne({userId, parentId});
    }

    async findNewestLikes(parentId: string): Promise<LikeDocument[]> {

        return await LikeModel
            .find({parentId})
            .sort({createdAt: -1})
            .limit(3)
            .exec();
    }

    async findAllLikes(parentsIds: string[]): Promise<LikeDocument[]> {

        return await LikeModel
            .find({parentId: {$in: parentsIds}})
            .sort({createdAt: -1})
            .exec();
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

export {LikesRepository};