type StockIn = {
    id: string;
    quantity: number;
    storeId: string;
    productId: string;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

type StockOut = {
    id: string;
    quantity: number;
    storeId: string;
    productId: string;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export {
    StockIn,
    StockOut,
}