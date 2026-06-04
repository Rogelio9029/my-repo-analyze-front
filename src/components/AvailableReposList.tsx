import type { Repo } from "../services/repo.service";

interface AvailableReposListProps {
    repos: Repo[];
    loading: boolean;
    trackedFullNames: string[];
    onTrackRepo: (repo: Repo) => void;
}

export function AvailableReposList({
    repos,
    loading,
    trackedFullNames,
    onTrackRepo,
}: AvailableReposListProps) {
    const availableRepos = repos.filter(
        (repo) => !trackedFullNames.includes(repo.full_name)
    );

    if (loading) {
        return (
            <div className="repo-loading-list" aria-label="Cargando repositorios">
                <span />
                <span />
                <span />
            </div>
        );
    }

    if (availableRepos.length === 0) {
        return (
            <div className="inline-empty">
                <h3>No hay repositorios disponibles</h3>
                <p>Los repos que ya estan vinculados no aparecen en esta lista.</p>
            </div>
        );
    }

    return (
        <div className="available-repo-list">
            {availableRepos.map((repo) => (
                <article className="available-repo-item" key={repo.id}>
                    <div className="repo-item-copy">
                        <h3>{repo.full_name}</h3>
                        <p>
                            <span className="repo-visibility">
                                {repo.private ? "Privado" : "Publico"}
                            </span>
                            <span>{repo.owner.login}</span>
                        </p>
                    </div>

                    <button
                        className="secondary-button"
                        type="button"
                        onClick={() => onTrackRepo(repo)}
                    >
                        Track
                    </button>
                </article>
            ))}
        </div>
    );
}
