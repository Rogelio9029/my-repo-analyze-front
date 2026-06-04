import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import {
    registerSchema,
    type RegisterSchema,
} from "../schemas/auth.schema";

import { register as registerUser } from "../services/auth.service";

function Register() {
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
    });

    async function onSubmit(data: RegisterSchema) {
        try {
            setSubmitError("");

            await registerUser(data);

            navigate("/login");
        } catch (error) {
            console.error(error);
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "No se pudo crear la cuenta."
            );
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-panel" aria-labelledby="register-title">
                <div className="auth-brand">
                    <span className="brand-mark">GC</span>
                    <span>GitCheck</span>
                </div>

                <div className="auth-copy">
                    <p className="eyebrow">Nuevo workspace</p>
                    <h1 id="register-title">Crea tu cuenta</h1>
                    <p>
                        Empieza a monitorear repositorios y revisa commits con
                        senales faciles de entender.
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
                        {isSubmitting ? "Creando..." : "Crear cuenta"}
                </button>
                </form>

                <p className="auth-switch">
                    Ya tienes cuenta?{" "}
                    <Link to="/login">
                        Iniciar sesion
                    </Link>
                </p>
            </section>

            <aside className="auth-aside" aria-hidden="true">
                <div className="signal-card">
                    <span className="signal-label">Repo tracking</span>
                    <strong>Live</strong>
                    <p>Repos vinculados, commits recientes y feedback en un solo lugar.</p>
                </div>
            </aside>
        </main>
    );
}

export default Register;
