export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    photo: string | null;
    refreshToken: string | null;
    role: string;
}