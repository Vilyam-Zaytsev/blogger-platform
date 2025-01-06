import {SortFilterType} from "../types/input-output-types/sort-filter-types";
import {SortQueryFilterType} from "../types/input-output-types/sort-query-filter-types";

const paginationParams = (filter: SortFilterType): SortQueryFilterType => {
    const pageNumber: number =
        filter.pageNumber
            ? Number(filter.pageNumber)
            : 1;
    const pageSize: number =
        filter.pageSize
            ? Number(filter.pageSize)
            : 10;
    const sortBy: string =
        filter.sortBy
            ? filter.sortBy === 'id'
                ? '_id'
                : filter.sortBy
            : 'createdAt';
    const sortDirection: 'asc' | 'desc' =
        filter.sortDirection === 'asc'
            ? 'asc'
            : 'desc';
    const searchNameTerm: string | null =
        filter.searchNameTerm
            ? filter.searchNameTerm
            : null;
    const searchLoginTerm: string | null =
        filter.searchLoginTerm
            ? filter.searchLoginTerm
            : null;
    const searchEmailTerm: string | null =
        filter.searchEmailTerm
            ? filter.searchEmailTerm
            : null;

    return {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchNameTerm,
    };
};

export {paginationParams};
