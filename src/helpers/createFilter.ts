import {ObjectId} from "mongodb";

const createFilter = (
    {
        nameOfSearchField,
        id = null,
        searchNameTerm = null
    }: {
        nameOfSearchField: string,
        id?: string | null,
        searchNameTerm?: string | null
    }) => {
    const byId = id
        ? {id: new ObjectId(id)}
        : {};
    const search = searchNameTerm
        ? {[nameOfSearchField]: {$regex: searchNameTerm, $options: 'i'}}
        : {};

    return {
        ...byId,
        ...search
    };
};

export {createFilter};