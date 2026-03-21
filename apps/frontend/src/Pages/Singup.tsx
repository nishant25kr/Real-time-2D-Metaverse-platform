import axios from "axios"
import { useState } from "react"
import { Login } from "./Login"

export const Signup = () => {
    const [username, setUsername] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [userId, setUserId] = useState<string>()
    const type: string = 'admin'

    async function SubmitForm() {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type
        })
        setUserId(res.data.userId)
        localStorage.setItem("userId", res.data.userId)

    }

    if (!userId) {
        return (
            <div>
                {userId ? `${userId}` : ""}
                <input type="text" onChange={(e) => { setUsername(e.target.value) }} />
                <input type="text" onChange={(e) => { setPassword(e.target.value) }} />
                <button onClick={() => { SubmitForm() }}>
                    Signup
                </button>
            </div>
        )
    }

    return (
        <Login userId={userId}/>
    )
}