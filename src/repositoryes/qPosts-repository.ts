import {PostDbType} from "../types/db-types/post-db-type";
import {postsCollection} from "../db/mongoDb";
import {ObjectId, Sort, WithId} from "mongodb";
import {createFilter} from "../helpers/createFilter";
import {sortQueryFilterType} from "../types/input-output-types/sort-query-filter-types";


const qPostsRepository = {
    async findPosts(sortQueryDto: sortQueryFilterType): Promise<WithId<PostDbType>[]> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            blogId
        } = sortQueryDto;

        const filter: any = createFilter(
            {
                blogId,
            }
        );

        return await postsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as Sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },
    async getPostsCount(blogId: string | null): Promise<number> {

        const filter: any = createFilter(
            {
                blogId,
            }
        );

        return postsCollection
            .countDocuments(filter);
    },
    async findPost(id: string | ObjectId): Promise<WithId<PostDbType> | null> {
            return await postsCollection
                .findOne({_id: new ObjectId(id)});
    },
};

export {qPostsRepository};