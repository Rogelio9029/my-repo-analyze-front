import { create } from "zustand";

const GITHUB_LINKED_KEY = "github_linked";

interface GithubStore {
    isGithubLinked: boolean;

    setGithubLinked: (isLinked: boolean) => void;

    disconnectGithub: () => void;
}

export const useGithubStore = create<GithubStore>((set) => ({
    isGithubLinked: localStorage.getItem(GITHUB_LINKED_KEY) === "true",

    setGithubLinked: (isLinked) => {
        if (isLinked) {
            localStorage.setItem(GITHUB_LINKED_KEY, "true");
        } else {
            localStorage.removeItem(GITHUB_LINKED_KEY);
        }

        set({
            isGithubLinked: isLinked,
        });
    },

    disconnectGithub: () => {
        localStorage.removeItem(GITHUB_LINKED_KEY);

        set({
            isGithubLinked: false,
        });
    },
}));
