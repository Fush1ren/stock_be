export interface BodyCreateUser {
    name: string;
    username: string;
    email: string;
    password: string;
    photo: string | undefined;
    role: number;
}
