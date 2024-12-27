const paginationParams = (query)=> {
    return {
        searchNameTerm: query.searchNameTerm
            ? String(query.searchNameTerm)
            : null,
        sortBy: query.sortBy
            ? String(query.sortBy)
            : 'createdAt',
        sortDirection: query.sortDirection
            ? String(query.sortDirection)
            : 'desc',
        pageNumber: query.pageNumber
            ? Number(query.pageNumber)
            : 1,
        pageSize: query.pageSize
            ? Number(query.pageSize)
            : 10,
    };
};

export {paginationParams};