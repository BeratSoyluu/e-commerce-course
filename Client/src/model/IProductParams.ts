export type OrderBy = "name" | "price" | "priceDesc" | "newest";

export interface ProductParams {
    searchTerm: string;
    orderBy: OrderBy;
    brands: string[];
    pageNumber: number;
    pageSize: number;
}
