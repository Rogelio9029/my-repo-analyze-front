const API_URL = import.meta.env.VITE_API_URL;

export const githubLogin = () => {
    window.location.href = `${API_URL}/github`;
};
