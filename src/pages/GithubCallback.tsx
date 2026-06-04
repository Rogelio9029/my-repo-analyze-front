import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../api/client";
import { useGithubStore } from "../features/github/store/github.store";

export default function GithubCallback() {
    const navigate = useNavigate();

    const hasFetched = useRef(false);

    const setGithubLinked = useGithubStore(
        (state) => state.setGithubLinked
    );

    useEffect(() => {
        if (hasFetched.current) return;

        hasFetched.current = true;

        const params = new URLSearchParams(window.location.search);

        const code = params.get("code");

        if (!code) return;

        const query = new URLSearchParams({
            code,
        });

        apiFetch(`/github/callback?${query.toString()}`, {
            authToken: "auth",
        })
            .then(() => {
                setGithubLinked(true);

                navigate("/dashboard");
            })

            .catch(console.error);
    }, [navigate, setGithubLinked]);

    return <h2>Connecting GitHub...</h2>;
}
