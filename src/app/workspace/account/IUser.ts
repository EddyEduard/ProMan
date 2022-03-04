export interface IUser {
    id: number;
    company_id: number;
    username: string;
    email: string;
    password: string;
    phone: string;
    roles: IRole[];
    hide_password?: boolean;
}

export interface IRole {
    id: number;
    name: string;
    description: string;
}