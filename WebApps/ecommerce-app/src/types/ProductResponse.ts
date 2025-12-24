import type { Product } from "./Product";

export interface ProductResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  items: Product[];
}