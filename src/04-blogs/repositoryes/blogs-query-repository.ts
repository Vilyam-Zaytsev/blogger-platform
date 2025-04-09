import {WithId} from "mongodb";
import {Paginator} from "../../common/types/input-output-types/pagination-sort-types";
import {BlogViewModel} from "../types/input-output-types";
import {injectable} from "inversify";
import {SortOptionsType} from "../../common/types/sort-options-type";
import {SortQueryDto} from "../../common/helpers/sort-query-dto";
import {Blog, BlogModel} from "../domain/blog-entity";

@injectable()
class BlogsQueryRepository {

    async findBlogs(sortQueryDto: SortQueryDto): Promise<BlogViewModel[]> {
//TODO: зачем мне здесь фильтр???
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm
        } = sortQueryDto;

        let filter: any = {};

        searchNameTerm
            ? filter = {name: {$regex: searchNameTerm, $options: 'i'}}
            : {};

        const blogs: WithId<Blog>[] = await BlogModel
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1} as SortOptionsType)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();

        return blogs.map(b => this._mapDbBlogToViewModel(b));
    }

    async findBlog(id: string): Promise<BlogViewModel | null> {

        const blog: WithId<Blog> | null = await BlogModel
            .findById(id)
            .exec();

        if (!blog) return null;

        return this._mapDbBlogToViewModel(blog);
    }

    async getBlogsCount(searchNameTerm: string | null): Promise<number> {

        let filter: any = {};

        searchNameTerm
            ? filter = {name: {$regex: searchNameTerm, $options: 'i'}}
            : {};

        return BlogModel
            .countDocuments(filter);
    }

    _mapDbBlogToViewModel(blog: WithId<Blog>): BlogViewModel {

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
        sortQueryDto: SortQueryDto
    ): Paginator<BlogViewModel> {

        return {
            pagesCount: Math.ceil(blogsCount / sortQueryDto.pageSize),
            page: sortQueryDto.pageNumber,
            pageSize: sortQueryDto.pageSize,
            totalCount: blogsCount,
            items: blogs
        };
    }
}

export {BlogsQueryRepository};