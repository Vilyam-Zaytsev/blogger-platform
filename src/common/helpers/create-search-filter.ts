import {SearchFilterType} from "../../types/input-output-types/pagination-sort-types";

const createSearchFilter = (searchFilter: SearchFilterType) => {

    const {
        blogId,
        searchNameTerm,
        searchLoginTerm,
        searchEmailTerm,
        nameOfSearchField
    } = searchFilter;

    const byBlogId = blogId
        ? {blogId}
        : {};
    const search = nameOfSearchField
        ? searchNameTerm
            ? {[nameOfSearchField]: {$regex: searchNameTerm, $options: 'i'}}
            : searchLoginTerm
                ? {[nameOfSearchField]: {$regex: searchLoginTerm, $options: 'i'}}
                : searchEmailTerm
                    ? {[nameOfSearchField]: {$regex: searchEmailTerm, $options: 'i'}}
                    : {}
        : {};

    return {
        ...byBlogId,
        ...search
    };
};

export {createSearchFilter};