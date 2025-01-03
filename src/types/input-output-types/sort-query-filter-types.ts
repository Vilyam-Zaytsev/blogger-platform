type sortQueryFilterType = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
    searchNameTerm: string | null,
    blogId: string | null
};

export {sortQueryFilterType};