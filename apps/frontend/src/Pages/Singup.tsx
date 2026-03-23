import axios from "axios"
import { useState } from "react"
import { Login } from "./Login"

export const Signup = () => {
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [userId, setUserId] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

    const type: string = "admin"

    async function SubmitForm() {
        try {
            setLoading(true)
            setError("")

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/signup`,
                {
                    username,
                    password,
                    type
                }
            )

            setUserId(res.data.userId)
            localStorage.setItem("userId", res.data.userId)

        } catch (err: any) {
            setError(err?.response?.data?.message || "Signup failed")
        } finally {
            setLoading(false)
        }
    }

    if (!userId) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-black text-white">
                <div className="bg-gray-900 p-8 rounded-2xl w-80 space-y-4">

                    <h2 className="text-2xl font-bold text-center">Signup</h2>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full p-2 rounded bg-gray-800"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 rounded bg-gray-800"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        onClick={SubmitForm}
                        disabled={loading}
                        className="w-full bg-blue-600 p-2 rounded hover:bg-blue-500"
                    >
                        {loading ? "Signing up..." : "Signup"}
                    </button>
                </div>
            </div>
        )
    }

    return <Login userId={userId} />
}