import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
    loginSchema,
    type LoginSchema,
} from "../schemas/auth.schema";

import { login } from "../services/auth.service";

import { useAuthStore } from "../store/auth.store";
import { useState } from "react";

function Login() {
    const navigate = useNavigate();

    const setAuth = useAuthStore((state) => state.setAuth);
    const [submitError, setSubmitError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(data: LoginSchema) {
        try {
            setSubmitError("");

            const response = await login(data);

            setAuth(response.token);

            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "No se pudo iniciar sesion."
            );
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-panel" aria-labelledby="login-title">
                <div className="auth-brand">
                    <span className="brand-mark">GC</span>
                    <span>GitCheck</span>
                </div>

                <div className="auth-copy">
                    <p className="eyebrow">Control de repos</p>
                    <h1 id="login-title">Inicia sesion</h1>
                    <p>
                        Revisa repositorios, commits y feedback tecnico desde un
                        espacio claro.
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    {submitError && (
                        <p className="form-alert" role="alert">
                            {submitError}
                        </p>
                    )}

                    <label className="field">
                        <span>Email</span>
                    <input
                        type="email"
                        placeholder="Email"
                        {...register("email")}
                    />

                    {errors.email && (
                            <small className="field-error">
                                {errors.email.message}
                            </small>
                    )}
                    </label>

                    <label className="field">
                        <span>Password</span>
                    <input
                        type="password"
                        placeholder="Password"
                        {...register("password")}
                    />

                    {errors.password && (
                            <small className="field-error">
                                {errors.password.message}
                            </small>
                    )}
                    </label>

                    <button className="primary-button full-width" disabled={isSubmitting}>
                        {isSubmitting ? "Validando..." : "Entrar"}
                </button>
                </form>

                <p className="auth-switch">
                    No tienes cuenta?{" "}
                    <Link to="/register">
                        Crear cuenta
                    </Link>
                </p>
            </section>

            <aside className="auth-aside" aria-hidden="true">
                <div className="signal-card">
                    <span className="signal-label">Commit quality</span>
                    <strong>8.7</strong>
                    <p>Feedback accionable antes de perder contexto.</p>
                </div>
            </aside>
        </main>
    );
}

export default Login;
