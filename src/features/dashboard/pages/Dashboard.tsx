import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "../../../api/client";
import { githubLogin } from "../../../services/github.service";

import {
    getCommitFeedback,
    getCommits,
    getRepoReadme,
    getRepos,
    trackRepo,
    unlinkRepo,
    type Commit,
    type CommitFeedback,
    type Repo,
    type TrackedRepo,
} from "../../../services/repo.service";

import { AvailableReposList } from "../../../components/AvailableReposList";
import { RepoTabs } from "../../../components/RepoTabs";
import { useGithubStore } from "../../github/store/github.store";
import { useTrackedReposStore } from "../../github/store/tracked-repos.store";

function Dashboard() {
    const isGithubLinked = useGithubStore(
        (state) => state.isGithubLinked
    );
    const setGithubLinked = useGithubStore(
        (state) => state.setGithubLinked
    );

    const trackedRepos = useTrackedReposStore((state) => state.trackedRepos);
    const selectedRepoId = useTrackedReposStore(
        (state) => state.selectedRepoId
    );
    const addTrackedRepo = useTrackedReposStore((state) => state.addTrackedRepo);
    const removeTrackedRepo = useTrackedReposStore(
        (state) => state.removeTrackedRepo
    );

    const [repos, setRepos] = useState<Repo[]>([]);

    const [loading, setLoading] = useState(false);
    const [readme, setReadme] = useState("");
    const [readmeLoading, setReadmeLoading] = useState(false);
    const [commits, setCommits] = useState<Commit[]>([]);
    const [commitsLoading, setCommitsLoading] = useState(false);
    const [commitPage, setCommitPage] = useState(1);
    const [totalCommits, setTotalCommits] = useState(0);
    const [totalCommitPages, setTotalCommitPages] = useState(1);
    const [selectedFeedback, setSelectedFeedback] =
        useState<CommitFeedback | null>(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [activeTab, setActiveTab] = useState("repo");
    const feedbackPanelRef = useRef<HTMLDivElement | null>(null);

    const selectedRepo =
        trackedRepos.find((repo) => String(repo.id) === selectedRepoId) ??
        null;

    const trackedFullNames = trackedRepos.map((repo) => repo.fullName);

    const handleGithubExpired = useCallback(
        (error: unknown) => {
            if (error instanceof ApiError && error.code === "GITHUB_TOKEN_EXPIRED") {
                setGithubLinked(false);
            }
        },
        [setGithubLinked]
    );

    useEffect(() => {
        async function loadRepos() {
            if (!isGithubLinked) return;

            try {
                setLoading(true);

                const data = await getRepos();

                setRepos(data);
            } catch (error) {
                console.error(error);
                handleGithubExpired(error);
            } finally {
                setLoading(false);
            }
        }

        loadRepos();
    }, [handleGithubExpired, isGithubLinked]);

    useEffect(() => {
        async function loadReadme() {
            if (!selectedRepo) {
                setReadme("");

                return;
            }

            try {
                setReadmeLoading(true);

                const content = await getRepoReadme(selectedRepo.id);

                setReadme(content);
            } catch (error) {
                console.error(error);
                setReadme("No se pudo cargar el README.");
                handleGithubExpired(error);
            } finally {
                setReadmeLoading(false);
            }
        }

        loadReadme();
    }, [handleGithubExpired, selectedRepo]);

    useEffect(() => {
        async function loadCommits() {
            if (!selectedRepo || activeTab !== "commits") return;

            try {
                setCommitsLoading(true);

                const data = await getCommits(selectedRepo.id, commitPage);

                setCommits(data.commits);
                setCommitPage(data.currentPage);
                setTotalCommits(data.totalCommits);
                setTotalCommitPages(data.totalPages);
            } catch (error) {
                console.error(error);
                setCommits([]);
                setTotalCommits(0);
                setTotalCommitPages(1);
                handleGithubExpired(error);
            } finally {
                setCommitsLoading(false);
            }
        }

        loadCommits();
    }, [activeTab, commitPage, handleGithubExpired, selectedRepo]);

    useEffect(() => {
        if (!feedbackLoading && !feedbackMessage && !selectedFeedback) return;

        feedbackPanelRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, [feedbackLoading, feedbackMessage, selectedFeedback]);

    async function handleTrackRepo(repo: Repo) {
        try {
            setActionMessage("");

            const trackedRepo = await trackRepo(repo);

            addTrackedRepo(normalizeTrackedRepo(trackedRepo, repo));

            setActionMessage(`${repo.full_name} se agrego a repos vinculados.`);
        } catch (error) {
            console.error(error);
            handleGithubExpired(error);
            setActionMessage("No se pudo vincular el repositorio.");
        }
    }

    async function handleUnlinkRepo(repo: TrackedRepo) {
        try {
            await unlinkRepo(repo.id);

            removeTrackedRepo(repo.id);
            setActionMessage(`${repo.fullName} se desvinculo correctamente.`);
        } catch (error) {
            console.error(error);
            setActionMessage("No se pudo desvincular el repositorio.");
        }
    }

    async function handleLoadCommitFeedback(commit: Commit) {
        if (!selectedRepo) return;

        try {
            setFeedbackLoading(true);
            setFeedbackMessage("");

            const feedback = await getCommitFeedback(selectedRepo.id, commit.id);

            setSelectedFeedback(feedback);
        } catch (error) {
            console.error(error);

            setSelectedFeedback(null);
            setFeedbackMessage(
                error instanceof Error
                    ? error.message
                    : "No se pudo cargar el feedback."
            );
        } finally {
            setFeedbackLoading(false);
        }
    }

    function normalizeTrackedRepo(trackedRepo: TrackedRepo, repo: Repo) {
        return {
            ...trackedRepo,
            id: trackedRepo.id ?? repo.id,
            name: trackedRepo.name ?? repo.name,
            fullName: trackedRepo.fullName ?? repo.full_name,
            owner: trackedRepo.owner ?? repo.owner.login,
        };
    }

    return (
        <section className="dashboard-page">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Panel de trabajo</p>
                    <h1>
                        {selectedRepo ? selectedRepo.name : "Repositorios"}
                    </h1>
                </div>

                <div className="page-metrics" aria-label="Resumen">
                    <span>{trackedRepos.length} vinculados</span>
                    <span>{repos.length} disponibles</span>
                </div>
            </header>

            {actionMessage && (
                <p className="status-banner" role="status">
                    {actionMessage}
                </p>
            )}

            {!isGithubLinked && (
                <div className="empty-state hero-empty">
                    <span className="empty-icon">git</span>
                    <h2>Conecta tu cuenta de GitHub</h2>
                    <p>
                        Vincula GitHub para consultar repositorios, trackear los que
                        importan y revisar feedback por commit.
                    </p>

                    <button
                        className="primary-button"
                        onClick={githubLogin}
                    >
                        Conectar GitHub
                    </button>
                </div>
            )}

            {isGithubLinked && (
                <div className="workspace single-panel">
                    <section className="repo-workspace">
                        {selectedRepo && (
                            <RepoTabs activeTab={activeTab} onTabChange={setActiveTab} />
                        )}

                        <div className="tab-content">
                            {!selectedRepo && (
                                <div className="repo-summary">
                                    <div className="section-heading">
                                        <p className="eyebrow">Primer paso</p>
                                        <h2>Selecciona o agrega un repo</h2>
                                        <p>
                                            Elige un repositorio disponible para comenzar
                                            a rastrearlo en GitCheck.
                                        </p>
                                    </div>

                                    <AvailableReposList
                                        repos={repos}
                                        loading={loading}
                                        trackedFullNames={trackedFullNames}
                                        onTrackRepo={handleTrackRepo}
                                    />
                                </div>
                            )}

                            {selectedRepo && activeTab === "repo" && (
                                <div className="repo-summary">
                                    <div className="repo-title-row">
                                        <div>
                                            <p className="eyebrow">Repo seleccionado</p>
                                            <h2>{selectedRepo.fullName}</h2>
                                        </div>
                                    </div>

                                    <div className="repo-meta">
                                        <span>Owner: {selectedRepo.owner}</span>
                                        <span>Repo: {selectedRepo.name}</span>
                                        <span>ID: {selectedRepo.id}</span>
                                    </div>

                                    <div className="readme-panel">
                                        {readmeLoading ? (
                                            <p>Cargando README...</p>
                                        ) : (
                                            <pre>{readme || "README no disponible."}</pre>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedRepo && activeTab === "commits" && (
                                <div className="commits-panel">
                                    <div className="commits-header">
                                        <div>
                                            <p className="eyebrow">Historial</p>
                                            <h2>Commits</h2>
                                        </div>
                                        <span>{totalCommits} commits</span>
                                    </div>

                                    <div className={`commits-split-layout ${!(feedbackLoading || feedbackMessage || selectedFeedback) ? 'full-width-list' : ''}`}>
                                        <div className="commits-list-side">
                                            {commitsLoading ? (
                                                <div className="repo-loading-list" aria-label="Cargando commits">
                                                    <span />
                                                    <span />
                                                    <span />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="table-shell">
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th>Commit</th>
                                                                    <th>Autor</th>
                                                                    <th>Fecha</th>
                                                                    <th>Feedback</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {commits.length === 0 && (
                                                                    <tr>
                                                                        <td colSpan={4}>
                                                                            No hay commits para mostrar.
                                                                        </td>
                                                                    </tr>
                                                                )}

                                                                {commits.map((commit) => (
                                                                    <tr key={commit.id ?? commit.sha}>
                                                                        <td>
                                                                            <strong>
                                                                                {commit.message ?? "Sin mensaje"}
                                                                            </strong>
                                                                            <small>
                                                                                #{commit.sha.slice(0, 7)}
                                                                            </small>
                                                                        </td>
                                                                        <td>{commit.author}</td>
                                                                        <td>
                                                                            {formatCommitDate(
                                                                                commit.createdAt
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            <button
                                                                                className="table-button"
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleLoadCommitFeedback(commit)
                                                                                }
                                                                            >
                                                                                Ver feedback
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    <div className="pagination">
                                                        <button
                                                            type="button"
                                                            disabled={commitPage <= 1 || commitsLoading}
                                                            onClick={() => setCommitPage((page) => page - 1)}
                                                        >
                                                            Anterior
                                                        </button>

                                                        <span>
                                                            Pagina {commitPage} de {totalCommitPages}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                commitPage >= totalCommitPages ||
                                                                commitsLoading
                                                            }
                                                            onClick={() => setCommitPage((page) => page + 1)}
                                                        >
                                                            Siguiente
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {(feedbackLoading ||
                                            feedbackMessage ||
                                            selectedFeedback) && (
                                            <div className="feedback-panel" ref={feedbackPanelRef}>
                                                {feedbackLoading && <p>Cargando feedback...</p>}

                                                {!feedbackLoading && feedbackMessage && (
                                                    <p>{feedbackMessage}</p>
                                                )}

                                                {!feedbackLoading && selectedFeedback && (
                                                    <>
                                                        <div className="feedback-score">
                                                            <div>
                                                                <p className="eyebrow">Analisis</p>
                                                                <h3>{selectedFeedback.commitName}</h3>
                                                            </div>
                                                            <strong>
                                                                {selectedFeedback.score}/10
                                                            </strong>
                                                        </div>

                                                        <p>{selectedFeedback.summary}</p>

                                                        <ul>
                                                            {selectedFeedback.feedback.map((item) => (
                                                                <li key={item}>{item}</li>
                                                            ))}
                                                        </ul>

                                                        <div className="feedback-files">
                                                            <span>
                                                                Agregados:{" "}
                                                                {selectedFeedback.filesAdded.length}
                                                            </span>
                                                            <span>
                                                                Modificados:{" "}
                                                                {
                                                                    selectedFeedback.filesModified
                                                                        .length
                                                                }
                                                            </span>
                                                            <span>
                                                                Removidos:{" "}
                                                                {
                                                                    selectedFeedback.filesRemoved
                                                                        .length
                                                                }
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedRepo && activeTab === "settings" && (
                                <div className="repo-summary">
                                    <h2>Configuracion del repo</h2>
                                    <p>Por ahora solo esta disponible desvincular el repositorio.</p>

                                    <button
                                        className="danger-button"
                                        onClick={() => handleUnlinkRepo(selectedRepo)}
                                    >
                                        Desvincular repo
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </section>
    );
}

function formatCommitDate(date?: string) {
    if (!date) return "Sin fecha";

    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}

export default Dashboard;
