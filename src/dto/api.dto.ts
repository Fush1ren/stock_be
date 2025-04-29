type APIResponse = {
    status: number;
    message: string;
}

type APIDataResponse<T> = {
    status: number;
    message: string;
    data: T;
}

export {
    APIResponse,
    APIDataResponse,
}