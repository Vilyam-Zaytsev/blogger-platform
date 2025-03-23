enum MatchMode {
    Exact = 'exact',
    Partial = 'partial',
}

type FilterCondition =
    { login?: string | { $regex: string; $options: string } }
    | { email?: string | { $regex: string; $options: string } }
    |{ name?: string | { $regex: string; $options: string } }
    |{ blogId?: string | { $regex: string; $options: string } };

type Paginator<T> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[];
};


export {
    MatchMode,
    FilterCondition,
    Paginator,
};