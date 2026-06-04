import { useEffect, useState } from "react";

import { AvailableReposList } from "../../../components/AvailableReposList";
import {
    getRepos,
    trackRepo,
    type Repo,
    type TrackedRepo,
} from "../../../services/repo.service";
import { useGithubStore } from "../../github/store/github.store";
import { useTrackedReposStore } from "../../github/store/tracked-repos.store";

function Repositories() {
    const isGithubLinked = useGithubStore((state) => state.isGithubLinked);
    const trackedRepos = useTrackedReposStore((state) => state.trackedRepos);
    const addTrackedRepo = useTrackedReposStore((state) => state.addTrackedRepo);

    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState("");

    const trackedFullNames = trackedRepos.map((repo) => repo.fullName);

    useEffect(() => {
        async function loadRepos() {
            if (!isGithubLinked) return;

            try {
                setLoading(true);

                const data = await getRepos();

                setRepos(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadRepos();
    }, [isGithubLinked]);

    async function handleTrackRepo(repo: Repo) {
        try {
            setActionMessage("");

            const trackedRepo = await trackRepo(repo);

            addTrackedRepo(normalizeTrackedRepo(trackedRepo, repo));

            setActionMessage(`${repo.full_name} se agrego a repos vinculados.`);
        } catch (error) {
            console.error(error);
            setActionMessage("No se pudo vincular el repositorio.");
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
                    <p className="eyebrow">Configuracion</p>
                    <h1>Agregar repositorio</h1>
                </div>

                <div className="page-metrics" aria-label="Resumen">
                    <span>{trackedRepos.length} vinculados</span>
                    <span>{repos.length} detectados</span>
                </div>
            </header>

            {actionMessage && (
                <p className="status-banner" role="status">
                    {actionMessage}
                </p>
            )}

            <div className="empty-state repo-config-panel">
                {!isGithubLinked && (
                    <>
                        <h2>GitHub no esta conectado</h2>
                        <p>Conecta GitHub desde el dashboard para cargar tus repositorios.</p>
                    </>
                )}

                {isGithubLinked && (
                    <>
                        <div className="section-heading">
                            <p className="eyebrow">Disponibles</p>
                            <h2>Repos para trackear</h2>
                            <p>
                                Agrega solo los repos que quieres revisar con feedback
                                de commits.
                            </p>
                        </div>

                        <AvailableReposList
                            repos={repos}
                            loading={loading}
                            trackedFullNames={trackedFullNames}
                            onTrackRepo={handleTrackRepo}
                        />
                    </>
                )}
            </div>
        </section>
    );
}

export default Repositories;
