import {FilterCondition, MatchMode} from "../../common/types/input-output-types/pagination-sort-types";
import {PostsSearchFilterType} from "../types/posts-search-filter-type";

const createPostsSearchFilter = (
    searchFilter: PostsSearchFilterType,
    match: MatchMode
) => {

    const {
        blogId
    } = searchFilter;

    const filter: { $or: FilterCondition[] } = {
        $or: []
    };

    if (match === MatchMode.Exact) {
        blogId
            ? filter.$or.push({blogId: blogId})
            : null;
    } else if (match === MatchMode.Partial) {

    }

    if (filter.$or.length < 1) return {};

    return filter;
};

export {createPostsSearchFilter};