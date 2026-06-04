import { apiFetch } from "../api/client";

export interface Repo {
    id: number;

    name: string;

    full_name: string;

    private: boolean;

    owner: {
        login: string;
    };
}

export interface TrackedRepo {
    id: string | number;

    githubId?: number;

    name: string;

    fullName: string;

    owner: string;
}

export interface ReadmeResponse {
    content?: string;
    readme?: string;
    downloadUrl?: string;
    htmlUrl?: string;
}

export interface CommitFeedback {
    id: string;

    commitName: string;

    summary: string;

    score: number;

    feedback: string[];

    filesAdded: string[];

    filesModified: string[];

    filesRemoved: string[];

    commitId: string;

    createdAt: string;
}

export interface CommitFeedbackPreview {
    id: string;

    commitName: string;

    summary: string;

    score: number;

    feedback: string;

    filesAdded: string;

    filesModified: string;

    filesRemoved: string;

    commitId: string;

    createdAt: string;
}

export interface Commit {
    id: string;

    sha: string;

    message: string;

    author: string;

    repositoryId: string;

    createdAt: string;

    feedback?: CommitFeedbackPreview | null;
}

export interface CommitsResponse {
    commits: Commit[];

    totalCommits: number;

    currentPage: number;

    totalPages: number;
}

interface RawCommitsResponse {
    commits: Commit[];

    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const getRepos = async () => {
    return apiFetch<Repo[]>("/github/repos", {
        authToken: "auth",
    });
};

export const trackRepo = async (repo: { name: string, owner: { login: string } }) => {
    return apiFetch<TrackedRepo>("/github/track", {
        authToken: "auth",
        method: "POST",

        body: JSON.stringify({
            repoName: repo.name,
            owner: repo.owner.login,
        }),
    });
};

export const getTrackedRepos = async () => {
    return apiFetch<TrackedRepo[]>("/repositories", {
        authToken: "auth",
    });
};

export const getRepoReadme = async (repoId: string | number) => {
    const response = await apiFetch<ReadmeResponse | string>(
        `/repositories/${repoId}/readme`,
        {
            authToken: "auth",
        }
    );

    if (typeof response === "string") {
        return response;
    }

    return response.content ?? response.readme ?? "";
};

export const unlinkRepo = async (repoId: string | number) => {
    return apiFetch<void>(`/repositories/${repoId}`, {
        authToken: "auth",
        method: "DELETE",
    });
};

export const getCommits = async (repoId: string | number, page = 1) => {
    const response = await apiFetch<RawCommitsResponse>(
        `/repositories/${repoId}/commits?page=${page}`,
        {
            authToken: "auth",
        }
    );

    return {
        commits: response.commits,
        totalCommits: response.pagination.total,
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
    };
};

export const getCommitFeedback = async (
    repoId: string | number,
    commitId: string
) => {
    return apiFetch<CommitFeedback>(
        `/repositories/${repoId}/commits/${commitId}/feedback`,
        {
            authToken: "auth",
        }
    );
};
