import {
    FilterCondition,
    MatchMode,
    UsersSearchFilterType
} from "../../common/types/input-output-types/pagination-sort-types";


const createUserSearchFilter = (
    searchFilter: UsersSearchFilterType,
    match: MatchMode
) => {

    const {
        searchLoginTerm,
        searchEmailTerm,
    } = searchFilter;

    const filter: { $or: FilterCondition[] } = {
        $or: []
    };

    if (match === MatchMode.Exact) {
        searchLoginTerm
            ? filter.$or.push({login: searchLoginTerm})
            : null;

        searchEmailTerm
            ? filter.$or.push({email: searchEmailTerm})
            : null;

    } else if (match === MatchMode.Partial) {
        searchLoginTerm
            ? filter.$or.push({login: {$regex: searchLoginTerm, $options: 'i'}})
            : null;

        searchEmailTerm
            ? filter.$or.push({email: {$regex: searchEmailTerm, $options: 'i'}})
            : null;
    }

    return filter;
};

export {createUserSearchFilter};