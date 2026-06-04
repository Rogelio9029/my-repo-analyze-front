interface RepoTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const tabs = [
    {
        id: "repo",
        label: "Resumen",
    },
    {
        id: "commits",
        label: "Commits",
    },
    {
        id: "settings",
        label: "Ajustes",
    },
];

export function RepoTabs({ activeTab, onTabChange }: RepoTabsProps) {
    return (
        <div className="repo-tabs" role="tablist" aria-label="Repositorio">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={activeTab === tab.id ? "active" : ""}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
