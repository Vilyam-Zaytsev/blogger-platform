import {BlogDbType} from "../types/blog-db-type";
import {blogsCollection} from "../../db/mongo-db/mongoDb";
import {ObjectId, Sort, WithId} from "mongodb";
import {
    MatchMode,
    PaginationAndSortFilterType,
    Paginator
} from "../../common/types/input-output-types/pagination-sort-types";
import {createBlogsSearchFilter} from "../helpers/create-blogs-search-filter";
import {BlogViewModel} from "../types/input-output-types";
import {CommentViewModel} from "../../07-comments/types/input-output-types";
import {injectable} from "inversify";

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

        const blogs: WithId<BlogDbType>[] = await blogsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as Sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return blogs.map(b => this._mapDbBlogToViewModel(b));
    }

    async findBlog(id: string): Promise<BlogViewModel | null> {

        const blog: WithId<BlogDbType> | null = await blogsCollection
            .findOne({_id: new ObjectId(id)});

        if (!blog) return null;

        return this._mapDbBlogToViewModel(blog);
    }

    async getBlogsCount(searchNameTerm: string | null): Promise<number> {

        const filter: any = createBlogsSearchFilter(
            {searchNameTerm},
            MatchMode.Partial
        );

        return blogsCollection
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