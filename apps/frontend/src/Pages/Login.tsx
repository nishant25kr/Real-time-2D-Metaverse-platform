import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Login = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Please enter your username and password.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/signin`,
                { username, password }
            );
            const token = res.data.token;
            const userId = res.data.userId;

            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);

            navigate(`/avatar/?signup_token=${token}`);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* Top bar */}
            <div className="px-10 py-5 border-b border-gray-100">
                <span className="text-sm font-semibold tracking-widest uppercase text-gray-800">MetaVerse</span>
            </div>

            {/* Form */}
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="w-full max-w-sm">

                    <div className="mb-7">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Don't have an account?{" "}
                            <button
                                onClick={() => navigate("/signup")}
                                className="text-gray-900 font-medium underline underline-offset-2 hover:text-gray-600 transition-colors"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full mt-1 bg-gray-900 text-white rounded-md py-3 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};