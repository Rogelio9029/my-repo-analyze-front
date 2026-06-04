import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuthStore } from "../features/auth/store/auth.store";
import { useGithubStore } from "../features/github/store/github.store";
import { useTrackedReposStore } from "../features/github/store/tracked-repos.store";
import { getTrackedRepos } from "../services/repo.service";

function DashboardLayout() {
    const navigate = useNavigate();

    const logout = useAuthStore((state) => state.logout);
    const token = useAuthStore((state) => state.token);
    const disconnectGithub = useGithubStore((state) => state.disconnectGithub);
    const setGithubLinked = useGithubStore((state) => state.setGithubLinked);
    const trackedRepos = useTrackedReposStore((state) => state.trackedRepos);
    const selectedRepoId = useTrackedReposStore(
        (state) => state.selectedRepoId
    );
    const setTrackedRepos = useTrackedReposStore((state) => state.setTrackedRepos);
    const selectTrackedRepo = useTrackedReposStore(
        (state) => state.selectTrackedRepo
    );
    const clearTrackedRepos = useTrackedReposStore(
        (state) => state.clearTrackedRepos
    );

    function handleLogout() {
        disconnectGithub();
        clearTrackedRepos();
        logout();
        navigate("/login");
    }

    useEffect(() => {
        async function loadTrackedRepos() {
            if (!token) return;

            try {
                const repos = await getTrackedRepos();

                setTrackedRepos(repos);

                if (repos.length > 0) {
                    setGithubLinked(true);

                    if (!selectedRepoId) {
                        selectTrackedRepo(repos[0].id);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }

        loadTrackedRepos();
    }, [
        selectTrackedRepo,
        selectedRepoId,
        setGithubLinked,
        setTrackedRepos,
        token,
    ]);

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <div className="app-logo">
                    <span className="brand-mark">GC</span>
                    <span>GitCheck</span>
                </div>

                <section className="linked-repos-section">
                    <div className="sidebar-section-header">
                        <span className="sidebar-title">Repos vinculados</span>
                        <span className="repo-count">{trackedRepos.length}</span>
                    </div>

                    <div className="linked-repo-list">
                        {trackedRepos.length === 0 && (
                            <div className="sidebar-empty">
                                <strong>Sin repos aun</strong>
                                <p>Agrega un repositorio para revisar sus commits.</p>
                            </div>
                        )}

                        {trackedRepos.map((repo) => (
                            <button
                                key={repo.id}
                                className={
                                    selectedRepoId === String(repo.id)
                                        ? "linked-repo active"
                                        : "linked-repo"
                                }
                                type="button"
                                onClick={() => {
                                    selectTrackedRepo(repo.id);
                                    navigate("/dashboard");
                                }}
                            >
                                <span>{repo.name}</span>
                                <small>{repo.owner}</small>
                            </button>
                        ))}
                    </div>
                </section>

                <nav className="app-nav" aria-label="Configuracion">
                    <NavLink to="/repositories">Configuracion</NavLink>
                </nav>

                <button className="logout-button" onClick={handleLogout}>
                    Cerrar sesion
                </button>
            </aside>

            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;
