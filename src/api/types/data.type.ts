export interface IQuery {
    take?: number;
    skip?: number;
    select?: any;
    orderBy?: any;
}

export interface InsertUpdateQuery {
    take?: any;
    skip?: any;
    select?: any;
    data: any;
}

export interface ISortParams {
    sortBy?: string
    sortOrder?: string | number
}