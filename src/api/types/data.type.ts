export interface IQuery {
    take?: number;
    skip?: number;
    select?: any;
}
export interface InsertUpdateQuery {
    take?: any;
    skip?: any;
    select?: any;
    data: any;
}