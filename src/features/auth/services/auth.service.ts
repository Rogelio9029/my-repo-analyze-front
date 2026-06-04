import { apiFetch } from "../../../api/client";

import type {
    LoginPayload,
    RegisterPayload,
    LoginResponse,
    RegisterResponse,
} from "../types/auth.types";

export async function login(data: LoginPayload) {
    return apiFetch<LoginResponse>("/auth/login", {
        authToken: "none",
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function register(data: RegisterPayload) {
    return apiFetch<RegisterResponse>("/auth/register", {
        authToken: "none",
        method: "POST",
        body: JSON.stringify(data),
    });
}
