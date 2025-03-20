import {BlogDbType} from "../types/blog-db-type";
import {ObjectId, Sort, WithId} from "mongodb";
import {
    MatchMode,
    PaginationAndSortFilterType,
    Paginator
} from "../../common/types/input-output-types/pagination-sort-types";
import {createBlogsSearchFilter} from "../helpers/create-blogs-search-filter";
import {BlogViewModel} from "../types/input-output-types";
import {injectable} from "inversify";
import {BlogModel} from "../../db/mongo-db/models/blog-model";
import {SortOptionsType} from "../../04-users/types/sort-options-type";

@injectable()
class BlogsQueryRepository {

    async findBlogs(sortQueryDto: PaginationAndSortFilterType): Promise<BlogViewModel[]> {

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

        const blogs: WithId<BlogDbType>[] = await BlogModel
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as SortOptionsType)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();

        return blogs.map(b => this._mapDbBlogToViewModel(b));
    }

    async findBlog(id: string): Promise<BlogViewModel | null> {

        const blog: WithId<BlogDbType> | null = await BlogModel
            .findOne({_id: new ObjectId(id)})
            .exec();

        if (!blog) return null;

        return this._mapDbBlogToViewModel(blog);
    }

    async getBlogsCount(searchNameTerm: string | null): Promise<number> {

        const filter: any = createBlogsSearchFilter(
            {searchNameTerm},
            MatchMode.Partial
        );

        return BlogModel
            .countDocuments(filter);
    }

    _mapDbBlogToViewModel(blog: WithId<BlogDbType>): BlogViewModel {

        return {
            id: String(blog._id),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        };
    }

    _mapBlogsViewModelToPaginationResponse(
        blogs: BlogViewModel[],
        blogsCount: number,
        paginationAndSortFilter: PaginationAndSortFilterType
    ): Paginator<BlogViewModel> {

        return {
            pagesCount: Math.ceil(blogsCount / paginationAndSortFilter.pageSize),
            page: paginationAndSortFilter.pageNumber,
            pageSize: paginationAndSortFilter.pageSize,
            totalCount: blogsCount,
            items: blogs
        };
    }
}

export {BlogsQueryRepository};