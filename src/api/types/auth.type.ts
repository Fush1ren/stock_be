export type Token = {
    accessToken: string;
    refreshToken?: string;
}

export interface UserLoginResponse {
    id: number;
    name: string;
    username: string;
    email: string;
    photo: string | null;
    role: {
        id: number;
        name: string;
    };
    accessToken: string;
    refreshToken?: string;
}