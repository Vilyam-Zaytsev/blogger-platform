import {BlogDbType} from "../types/blog-db-type";
import {blogsCollection} from "../../db/mongoDb";
import {ObjectId, Sort, WithId} from "mongodb";
import {createSearchFilter} from "../../common/helpers/create-search-filter";
import {PaginationAndSortFilterType, SearchFieldName} from "../../common/types/input-output-types/pagination-sort-types";

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
                nameOfSearchField: SearchFieldName.blog,
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
                nameOfSearchField: SearchFieldName.blog,
                searchNameTerm
            }
        );

        return blogsCollection
            .countDocuments(filter);
    },
    async findBlog(id: string): Promise<WithId<BlogDbType> | null> {
        return await blogsCollection
            .findOne({_id: new ObjectId(id)});
    },
};

export {qBlogsRepository};