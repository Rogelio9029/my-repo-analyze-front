export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface RegisterResponse {
    user: {
        id: string;
        email: string;
        role: string;
    };
}
