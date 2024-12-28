import {ObjectId} from "mongodb";

const createFilter = (nameOfSearchField, id, searchNameTerm) => {
    const byId = id
        ? {id: new ObjectId(id)}
        : {};
    const search = searchNameTerm
        ? {[nameOfSearchField]: {$regex: searchNameTerm, $options: 'i'}}
        : {};

};

export {createFilter};