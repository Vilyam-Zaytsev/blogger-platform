import {BlogsSearchFilterType} from "../types/blogs-search-filter-type";
import {FilterCondition, MatchMode} from "../../common/types/input-output-types/pagination-sort-types";

const createBlogsSearchFilter = (
    searchFilter: BlogsSearchFilterType,
    match: MatchMode
) => {

    const {
        searchNameTerm
    } = searchFilter;

    const filter: { $or: FilterCondition[] } = {
        $or: []
    };

    if (match === MatchMode.Exact) {
        searchNameTerm
            ? filter.$or.push({name: searchNameTerm})
            : null;
    } else if (match === MatchMode.Partial) {
        searchNameTerm
            ? filter.$or.push({login: {$regex: searchNameTerm, $options: 'i'}})
            : null;
    }

    if (filter.$or.length < 1) return {};

    return filter;
};

export {createBlogsSearchFilter};