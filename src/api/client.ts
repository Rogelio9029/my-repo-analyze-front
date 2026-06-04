const API_URL = import.meta.env.VITE_API_URL;

type AuthToken = "auth" | "none";

type ApiFetchOptions = RequestInit & {
    authToken?: AuthToken;
};

export class ApiError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

function getToken(authToken: AuthToken) {
    if (authToken === "none") return null;

    return localStorage.getItem("token");
}

export async function apiFetch<T>(
    endpoint: string,
    options?: ApiFetchOptions
): Promise<T> {
    const { authToken = "auth", ...fetchOptions } = options ?? {};

    const token = getToken(authToken);

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,

        headers: {
            "Content-Type": "application/json",

            ...(token && {
                Authorization: `Bearer ${token}`,
            }),

            ...fetchOptions.headers,
        },
    });

    if (!response.ok) {
        let message = "Something went wrong";
        let code: string | undefined;

        try {
            const error = await response.json();

            message = error.message;
            code = error.code;
        } catch {
            // Ignore non-JSON error responses.
        }

        throw new ApiError(message, response.status, code);
    }

    return response.json();
}
