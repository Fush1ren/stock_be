type BodyCreateStockIn = {
    quantity: number;
    storeId: string;
    productId: string;
    date: Date | string;
}

type BodyCreateStockOut = {
    quantity: number;
    storeId: string;
    productId: string;
    date: Date | string;
}

export {
    BodyCreateStockIn,
    BodyCreateStockOut,
}