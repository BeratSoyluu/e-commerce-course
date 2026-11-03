//? Backend'deki MetaData sınıfının karşılığı; "Pagination" header'ından okunur.
export interface MetaData {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    metaData: MetaData;
}
