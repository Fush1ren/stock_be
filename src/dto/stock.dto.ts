import { StatusProduct } from "@prisma/client";

export interface BodyCreateStoreStock {
    quantity: number;
    status: StatusProduct;
    storeId: number;
    productId: number;
    userId: number;
}

export type BodyCreateWareHouseStock = Omit<BodyCreateStoreStock, 'storeId'>;

export type ProductStockIn = Omit<BodyCreateStoreStock, 'storeId'>;

export type ProductStockMutation = Omit<BodyCreateStoreStock, 'storeId'>;

export type ProductStockOut = ProductStockIn;

export interface BodyCreateStockIn {
    stockInCode: string;
    date: Date | string;
    toWarehouse: boolean;
    storeId: number;
    userId: number;
    products: ProductStockIn[];
}

export interface BodyCreateStockOut {
    stockOutCode: string;
    date: Date | string;
    storeId: number;
    userId: number;
    products: ProductStockOut[];
}

export interface BodyCreateStockMutation {
    stockMutationCode: string;
    date: Date | string;
    fromWarehouse: boolean;
    fromStoreId: number | null;
    toStoreId: number;
    userId: number;
    products: ProductStockMutation[];
}
