import {injectable} from "inversify";
import {GroupedLikesByPostId, Like, LikeDocument, LikeModel, LikeStatus} from "../like-entity";
import {WithId} from "mongodb";

@injectable()
class LikesRepository {

    async findLikesByUserId(userId: string): Promise<LikeDocument[]> {

        return LikeModel
            .find({userId});
    }

    async findLikesByParentId(parentId: string): Promise<LikeDocument[]> {

        return LikeModel
            .find({parentId});
    }

    async findLikeByUserIdAndParentId(userId: string, parentId: string): Promise<LikeDocument | null> {

        return LikeModel
            .findOne({userId, parentId});
    }

    async findLikesByUserIdAndParentsIds(userId: string, parentsIds: string[]): Promise<LikeDocument[]> {

        return LikeModel
            .find({
                userId,
                parentId: {$in: parentsIds}
            });
    }

    async findRecentLikesForOnePost(parentId: string): Promise<LikeDocument[]> {

        const filter: any = {
            status: LikeStatus.Like,
            parentId
        };

        return await LikeModel
            .find(filter)
            .sort({createdAt: -1})
            .limit(3)
            .exec();
    }

    async findRecentLikesForAllPosts(parentsIds: string[]): Promise<GroupedLikesByPostId[]> {

        return await LikeModel
            .aggregate([
                {
                    $match: {
                        parentId: {$in: parentsIds},
                        status: LikeStatus.Like
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $group: {
                        _id: '$parentId',
                        recentLikes: {$push: '$$ROOT'}
                    }
                },
                {
                    $project: {
                        _id: 0,
                        postId: '$_id',
                        recentLikes: {$slice: ['$recentLikes', 3]}
                    }
                }
            ])
            .exec();
    }

    //TODO: Как тут сформировать запрос без агрегации!?????

    // async findRecentLikesForAllPosts(parentsIds: string[]): Promise<LikeDocument[]> {
    //
    //     const filter = {
    //         parentId: {$in: parentsIds},
    //         status: LikeStatus.Like
    //     };
    //
    //     return await LikeModel
    //         .find({
    //     //         parentId: {$in: parentsIds},
    //     //         status: LikeStatus.Like
    //     //     })
    //         .sort({createdAt: -1})
    //         .limit(3)
    //         .exec();
    // }

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