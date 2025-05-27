export interface BodyCreateProduct {
    name: string;
    code: string;
    description: string;
    unitId: number;
    categoryId: number;
    brandId: number;
}

export interface BodyUpdateProduct {
    id: number;
    name: string;
    description: string;
    categoryId: number;
    brandId: number;
    unitId: number;
}

export interface BodyUpdateProductUnit {
    id: number;
    name: string;
}

export interface BodyDeleteProductData {
    id: number[];
}