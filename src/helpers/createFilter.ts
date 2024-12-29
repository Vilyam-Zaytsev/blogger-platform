import {ObjectId} from "mongodb";

const createFilter = (
    {
        nameOfSearchField = null,
        blogId = null,
        searchNameTerm = null
    }: {
        nameOfSearchField?: string | null,
        blogId?: string | null,
        searchNameTerm?: string | null
    }) => {
    const byId = blogId
        ? {blogId}
        : {};
    const search = searchNameTerm && nameOfSearchField
        ? {[nameOfSearchField]: {$regex: searchNameTerm, $options: 'i'}}
        : {};

    return {
        ...byId,
        ...search
    };
};

export {createFilter};