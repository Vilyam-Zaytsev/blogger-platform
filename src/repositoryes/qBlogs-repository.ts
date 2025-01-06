import {BlogDbType} from "../types/db-types/blog-db-type";
import {blogsCollection} from "../db/mongoDb";
import {ObjectId, Sort, WithId} from "mongodb";
import {createSearchFilter} from "../helpers/create-search-filter";
import {PaginationAndSortFilterType} from "../types/input-output-types/pagination-sort-types";

const qBlogsRepository = {
    async findBlogs(sortQueryDto: PaginationAndSortFilterType): Promise<WithId<BlogDbType>[]> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm
        } = sortQueryDto;

        const filter: any = createSearchFilter(
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

        const filter: any = createSearchFilter(
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