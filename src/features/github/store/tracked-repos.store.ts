import { create } from "zustand";

import type { TrackedRepo } from "../../../services/repo.service";

const SELECTED_REPO_KEY = "selected_tracked_repo";

interface TrackedReposStore {
    trackedRepos: TrackedRepo[];
    selectedRepoId: string | null;
    setTrackedRepos: (repos: TrackedRepo[]) => void;
    addTrackedRepo: (repo: TrackedRepo) => void;
    removeTrackedRepo: (repoId: string | number) => void;
    selectTrackedRepo: (repoId: string | number | null) => void;
    clearTrackedRepos: () => void;
}

export const useTrackedReposStore = create<TrackedReposStore>((set) => ({
    trackedRepos: [],

    selectedRepoId: localStorage.getItem(SELECTED_REPO_KEY),

    setTrackedRepos: (repos) => {
        set((state) => {
            const selectedRepoExists = repos.some(
                (repo) => String(repo.id) === state.selectedRepoId
            );

            const selectedRepoId = selectedRepoExists
                ? state.selectedRepoId
                : null;

            if (selectedRepoId) {
                localStorage.setItem(SELECTED_REPO_KEY, selectedRepoId);
            } else {
                localStorage.removeItem(SELECTED_REPO_KEY);
            }

            return {
                trackedRepos: repos,
                selectedRepoId,
            };
        });
    },

    addTrackedRepo: (repo) => {
        set((state) => {
            const nextRepos = [
                ...state.trackedRepos.filter(
                    (trackedRepo) => String(trackedRepo.id) !== String(repo.id)
                ),
                repo,
            ];

            const selectedRepoId = String(repo.id);

            localStorage.setItem(SELECTED_REPO_KEY, selectedRepoId);

            return {
                trackedRepos: nextRepos,
                selectedRepoId,
            };
        });
    },

    removeTrackedRepo: (repoId) => {
        set((state) => {
            const nextRepos = state.trackedRepos.filter(
                (repo) => String(repo.id) !== String(repoId)
            );

            const nextSelected =
                state.selectedRepoId === String(repoId)
                    ? null
                    : state.selectedRepoId;

            if (nextSelected) {
                localStorage.setItem(SELECTED_REPO_KEY, nextSelected);
            } else {
                localStorage.removeItem(SELECTED_REPO_KEY);
            }

            return {
                trackedRepos: nextRepos,
                selectedRepoId: nextSelected,
            };
        });
    },

    selectTrackedRepo: (repoId) => {
        const selectedRepoId = repoId ? String(repoId) : null;

        if (selectedRepoId) {
            localStorage.setItem(SELECTED_REPO_KEY, selectedRepoId);
        } else {
            localStorage.removeItem(SELECTED_REPO_KEY);
        }

        set({
            selectedRepoId,
        });
    },

    clearTrackedRepos: () => {
        localStorage.removeItem(SELECTED_REPO_KEY);

        set({
            trackedRepos: [],
            selectedRepoId: null,
        });
    },
}));
