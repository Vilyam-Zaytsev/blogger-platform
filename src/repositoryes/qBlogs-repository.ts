import {BlogDbType} from "../types/db-types/blog-db-type";
import {blogsCollection} from "../db/mongoDb";
import {ObjectId, Sort, WithId} from "mongodb";
import {createFilter} from "../helpers/createFilter";
import {SortQueryFilterType} from "../types/input-output-types/sort-query-filter-types";

const qBlogsRepository = {
    async findBlogs(sortQueryDto: SortQueryFilterType): Promise<WithId<BlogDbType>[]> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm
        } = sortQueryDto;

        const filter: any = createFilter(
            {
                nameOfSearchField: 'name',
                searchNameTerm
            }
        );

        return await blogsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as Sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },
    async getBlogsCount(searchNameTerm: string | null): Promise<number> {

        const filter: any = createFilter(
            {
                nameOfSearchField: 'name',
                searchNameTerm
            }
        );

        return blogsCollection
            .countDocuments(filter);
    },
    async findBlog(id: string | ObjectId): Promise<WithId<BlogDbType> | null> {
        return await blogsCollection
            .findOne({_id: new ObjectId(id)});
    },
};

export {qBlogsRepository};