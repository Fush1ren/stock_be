export type StockIn = {
    id: string;
    quantity: number;
    storeId: string;
    productId: string;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export type StockOut = {
    id: string;
    quantity: number;
    storeId: string;
    productId: string;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}


export interface GetStockInSelect {
    id: true,
    transactionCode: true,
    date: true,
    createdAt: true,
    updatedAt: true,
    toWarehouse: true,
    toStore: {
        select: {
            id: true,
            name: true,
        }
    },
    createdBy: {
        select: {
            id: true,
            name: true,
        }
    },
    updatedBy: {
        select: {
            id: true,
            name: true,
        }
    },
    StockInDetail: {
        select: {
            productId: true,
            quantity: true,
        }
    }
}