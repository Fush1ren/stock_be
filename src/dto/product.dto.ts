import { QueryParams } from "./api.dto";

export interface BodyCreateProduct {
    name: string;
    code: string;
    description?: string;
    unitId: number;
    categoryId: number;
    brandId: number;
}

export interface BodyUpdateProduct {
    name: string;
    description: string;
    categoryId: number;
    brandId: number;
    unitId: number;
}

export interface BodyUpdateProductUnit {
    name: string;
}

export interface BodyDeleteProductData {
    id: number[];
}

export interface GetProductUnitParams extends QueryParams {
    name?: string;
    updateAt?: string;
    createdAt?: string;
}