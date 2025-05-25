export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    photo: Uint8Array | null;
    refreshToken: string | null;
    role: string;
}