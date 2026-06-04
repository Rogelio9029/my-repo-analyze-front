import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";

import GithubCallback from "../pages/GithubCallback";

import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";

import Dashboard from "../features/dashboard/pages/Dashboard";

import Repositories from "../features/repositories/pages/Repositories";
import Commits from "../features/commits/pages/Commits";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },

    {
        path: "/register",
        element: <Register />,
    },

    {
        path: "/auth/github/callback",
        element: <GithubCallback />,
    },

    {
        element: <ProtectedRoute />,

        children: [
            {
                element: <DashboardLayout />,

                children: [
                    {
                        path: "/",
                        element: <Dashboard />,
                    },

                    {
                        path: "/dashboard",
                        element: <Dashboard />,
                    },

                    {
                        path: "/repositories",
                        element: <Repositories />,
                    },

                    {
                        path: "/commits",
                        element: <Commits />,
                    },
                ],
            },
        ],
    },
]);