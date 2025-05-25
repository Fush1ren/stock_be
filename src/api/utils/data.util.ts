import { IQuery } from "../types/data.type";

export const getPage = (page: number, limit: number): IQuery => {
    const skip = (page * limit) - limit;
    const take = limit;
    return {
        take,
        skip
    }
}