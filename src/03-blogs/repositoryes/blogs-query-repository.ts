import {BlogDbType} from "../types/blog-db-type";
import {blogsCollection} from "../../db/mongoDb";
import {ObjectId, Sort, WithId} from "mongodb";
import {
    MatchMode,
    PaginationAndSortFilterType,
} from "../../common/types/input-output-types/pagination-sort-types";
import {createBlogsSearchFilter} from "../helpers/create-blogs-search-filter";
import {BlogViewModel} from "../types/input-output-types";

const blogsQueryRepository = {
    async findBlogs(sortQueryDto: PaginationAndSortFilterType): Promise<WithId<BlogDbType>[]> {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm
        } = sortQueryDto;

        const filter: any = createBlogsSearchFilter(
            {searchNameTerm},
            MatchMode.Partial
        );

        return await blogsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as Sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },

    async findBlog(id: string): Promise<BlogViewModel | null> {

        const blog: WithId<BlogDbType> | null = await blogsCollection
            .findOne({_id: new ObjectId(id)});

        if (!blog) return null;

        return this._mapDbBlogsToViewModel(blog);
    },

    async getBlogsCount(searchNameTerm: string | null): Promise<number> {

        const filter: any = createBlogsSearchFilter(
            {searchNameTerm},
            MatchMode.Partial
        );

        return blogsCollection
            .countDocuments(filter);
    },

    _mapDbBlogsToViewModel(blog: WithId<BlogDbType>): BlogViewModel {

        return {
            id: String(blog._id),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        };
    }
};

export {blogsQueryRepository};