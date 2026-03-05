"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Factory } from "lucide-react";
import Logo from "@/components/Logo";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError("Invalid credentials. Please try again.");
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl ring-1 ring-slate-100">
                <div className="text-center flex flex-col items-center">
                    <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-105">
                       <Logo />
                    </div>
                    <p className="mt-2 text-sm text-slate-500 font-medium">
                        Techser Plant Management System &bull; Secure Login
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                            <div className="text-sm font-semibold text-red-800 text-center">{error}</div>
                        </div>
                    )}
                    <div className="space-y-5 shadow-sm">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
                                Email address
                            </label>
                            <div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                                    placeholder="admin@techser.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
                                Password
                            </label>
                            <div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? "Authenticating..." : "Sign in to Workspace"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
